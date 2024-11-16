// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IStaker {
    function stake(address beneficiary, uint256 amount) external;

    function redeem() external;
}

/// @title - A simple messenger contract for transferring tokens to a receiver  that calls a staker contract.
contract FluxUseMain is OwnerIsCreator,ReentrancyGuard {

      struct Subscription {
        uint256 id;
        string name;
        string description;
        address serviceProvider;
        uint256 baseAmount; 
        address token;
        uint256 startTime;
        Frequency frequency;
        bool active;
    }

    enum Frequency {
        Monthly,
        Quarterly,
        HalfYearly,
        Annually
    }

    struct Group {
        uint256 id;
        string name;
        address[] members;
        mapping(address => uint256) payments;
        uint256 totalPayments;
        mapping(address => Transaction[]) expenses; 
        bool active;
    }

    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        address token;
        uint256 timestamp;
    }


    struct UserSubscription {
        uint256 subscriptionId;
        uint256 nextPaymentDue;
        uint256 amount;
    }
    
    uint256 private nextSubscriptionId = 1;
    uint256 private nextGroupId = 1;


    mapping(uint256 => Subscription) public subscriptions; 
    mapping(address => UserSubscription[]) public userSubscriptions; 
    mapping(uint256 => Group) public groups;
    mapping(address => Transaction[]) public transactionLogs;


    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IERC20 public usdcToken; // USDC token contract


       event SubscriptionCreated(
        uint256 indexed subscriptionId,
        string name,
        string description,
        address indexed serviceProvider,
        uint256 baseAmount,
        address token
    );
   event SubscriptionSelected(
        address indexed user,
        uint256 indexed subscriptionId,
        uint256 amount,
        uint256 nextPaymentDue
    );


    modifier subscriptionExists(uint256 subscriptionId) {
        require(subscriptions[subscriptionId].serviceProvider != address(0), "Subscription does not exist");
        _;
    }


    event DirectPayment(
        address indexed sender,
        address indexed receiver,
        address token,
        uint256 amount,
        uint256 timestamp
    );

    event SubscriptionUpdated(
        bytes32 indexed subscriptionId,
        uint256 newAmount,
        uint256 newInterval
    );

    event PaymentWithdrawn(uint256 indexed groupId, address indexed member, uint256 amount);
    event MemberRemoved(uint256 indexed groupId, address indexed member);
    event GroupCreated(uint256 indexed groupId, string name, address[] members);
    event ExpenseAdded(uint256 indexed groupId, address indexed member, uint256 amount);
    event PaymentReleased(uint256 indexed subscriptionId, uint256 amount, uint256 timestamp);
    event GroupDeactivated(uint256 indexed groupId);

      modifier onlyMember(uint256 groupId) {
        bool isMember = false;
        for (uint256 i = 0; i < groups[groupId].members.length; i++) {
            if (groups[groupId].members[i] == msg.sender) {
                isMember = true;
                break;
            }
        }
        require(isMember, "Not a group member");
        _;
    }

    modifier groupExists(uint256 groupId) {
        require(groups[groupId].active, "Group does not exist or is inactive");
        _;
    }
    // Custom errors to provide more descriptive revert messages.
    error InvalidRouter(); // Used when the router address is 0
    error InvalidLinkToken(); // Used when the link token address is 0
    error InvalidUsdcToken(); // Used when the usdc token address is 0
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); // Used to make sure contract has enough balance to cover the fees.
    error NothingToWithdraw(); // Used when trying to withdraw Ether but there's nothing to withdraw.
    error InvalidDestinationChain(); // Used when the destination chain selector is 0.
    error InvalidReceiverAddress(); // Used when the receiver address is 0.
    error NoReceiverOnDestinationChain(uint64 destinationChainSelector); // Used when the receiver address is 0 for a given destination chain.
    error AmountIsZero(); // Used if the amount to transfer is 0.
    error InvalidGasLimit(); // Used if the gas limit is 0.
    error NoGasLimitOnDestinationChain(uint64 destinationChainSelector); // Used when the gas limit is 0.

    // Event emitted when a message is sent to another chain.
    event MessageSent(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
        address indexed receiver, // The address of the receiver contract on the destination chain.
        address beneficiary, // The beneficiary of the staked tokens on the destination chain.
        address token, // The token address that was transferred.
        uint256 tokenAmount, // The token amount that was transferred.
        address feeToken, // the token address used to pay CCIP fees.
        uint256 fees // The fees paid for sending the message.
    );

    IRouterClient private immutable i_router;
    IERC20 private immutable i_linkToken;
    IERC20 private immutable i_usdcToken;

    // Mapping to keep track of the receiver contract per destination chain.
    mapping(uint64 => address) public s_receivers;
    // Mapping to store the gas limit per destination chain.
    mapping(uint64 => uint256) public s_gasLimits;

    modifier validateDestinationChain(uint64 _destinationChainSelector) {
        if (_destinationChainSelector == 0) revert InvalidDestinationChain();
        _;
    }

    /// @notice Constructor initializes the contract with the router address.
    /// @param _router The address of the router contract.
    /// @param _link The address of the link contract.
    /// @param _usdcToken The address of the usdc contract.
    constructor(address _router, address _link, address _usdcToken) {
        if (_router == address(0)) revert InvalidRouter();
        if (_link == address(0)) revert InvalidLinkToken();
        if (_usdcToken == address(0)) revert InvalidUsdcToken();
        i_router = IRouterClient(_router);
        i_linkToken = IERC20(_link);
        i_usdcToken = IERC20(_usdcToken);
    }

   

  function setReceiverForDestinationChain(
        uint64 _destinationChainSelector,
        address _receiver
    ) external onlyOwner validateDestinationChain(_destinationChainSelector) {
        if (_receiver == address(0)) revert InvalidReceiverAddress();
        s_receivers[_destinationChainSelector] = _receiver;
    }

    /// @dev Set the gas limit for a given destination chain.
    /// @notice This function can only be called by the owner.
    /// @param _destinationChainSelector The selector of the destination chain.
    /// @param _gasLimit The gas limit on the destination chain .
    function setGasLimitForDestinationChain(
        uint64 _destinationChainSelector,
        uint256 _gasLimit
    ) external onlyOwner validateDestinationChain(_destinationChainSelector) {
        if (_gasLimit == 0) revert InvalidGasLimit();
        s_gasLimits[_destinationChainSelector] = _gasLimit;
    }

    function sendMessagePayLINK(
        uint64 _destinationChainSelector,
        address _beneficiary,
        uint256 _amount
    )
        external
        validateDestinationChain(_destinationChainSelector)
        returns (bytes32 messageId)
    {
        address receiver = s_receivers[_destinationChainSelector];
        if (receiver == address(0))
            revert NoReceiverOnDestinationChain(_destinationChainSelector);
        if (_amount == 0) revert AmountIsZero();
        uint256 gasLimit = s_gasLimits[_destinationChainSelector];
        if (gasLimit == 0)
            revert NoGasLimitOnDestinationChain(_destinationChainSelector);
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        // address(linkToken) means fees are paid in LINK
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(i_usdcToken),
            amount: _amount
        });



        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver), // ABI-encoded receiver address
            data: abi.encodeWithSelector(
                IStaker.stake.selector,
                _beneficiary,
                _amount
            ), // Encode the function selector and the arguments of the stake function
            tokenAmounts: tokenAmounts, // The amount and type of token being transferred
            extraArgs: Client._argsToBytes(
                // Additional arguments, setting gas limit and allowing out-of-order execution.
                // Best Practice: For simplicity, the values are hardcoded. It is advisable to use a more dynamic approach
                // where you set the extra arguments off-chain. This allows adaptation depending on the lanes, messages,
                // and ensures compatibility with future CCIP upgrades. Read more about it here: https://docs.chain.link/ccip/best-practices#using-extraargs
                Client.EVMExtraArgsV2({
                    gasLimit: gasLimit, // Gas limit for the callback on the destination chain
                    allowOutOfOrderExecution: true // Allows the message to be executed out of order relative to other messages from the same sender
                })
            ),
            // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
            feeToken: address(i_linkToken)
        });

        // Get the fee required to send the CCIP message
        uint256 fees = i_router.getFee(
            _destinationChainSelector,
            evm2AnyMessage
        );

        if (fees > i_linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(i_linkToken.balanceOf(address(this)), fees);

        // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
        i_linkToken.approve(address(i_router), fees);

        // approve the Router to spend usdc tokens on contract's behalf. It will spend the amount of the given token
        i_usdcToken.approve(address(i_router), _amount);

        // Send the message through the router and store the returned message ID
        messageId = i_router.ccipSend(
            _destinationChainSelector,
            evm2AnyMessage
        );

        // Emit an event with message details
        emit MessageSent(
            messageId,
            _destinationChainSelector,
            receiver,
            _beneficiary,
            address(i_usdcToken),
            _amount,
            address(i_linkToken),
            fees
        );

        // Return the message ID
        return messageId;
    }

   

  

    function approveAllowance(address contractAddress, uint256 amount) external {
        i_usdcToken.approve(contractAddress, amount);
    }

    // Function to check the current allowance for the contract to spend the sender's USDC
    function checkAllowance(address _owner) external view returns (uint256) {
        return i_usdcToken.allowance(_owner, address(this));
    }

    function sendPayment(
        address receiver,
        uint256 amount,
        address token
    ) external nonReentrant {
        require(receiver != address(0), "Receiver address invalid");
        require(amount > 0, "Amount must be greater than zero");

        IERC20(token).transferFrom(msg.sender, receiver, amount);

        transactionLogs[msg.sender].push(
            Transaction({
                sender: msg.sender,
                receiver: receiver,
                amount: amount,
                token: token,
                timestamp: block.timestamp
            })
        );

        emit DirectPayment(msg.sender, receiver, token, amount, block.timestamp);
    }

    function getTransactionHistory(address user) external view returns (Transaction[] memory) {
        return transactionLogs[user];
    }

    function createSubscription(
        string calldata name,
        string calldata description,
        uint256 baseAmount, 
        address token
    ) external nonReentrant {
        subscriptions[nextSubscriptionId] = Subscription({
            id: nextSubscriptionId,
            name: name,
            description: description,
            serviceProvider: msg.sender,
            baseAmount: baseAmount,
            token: token,
            startTime: block.timestamp,
            frequency: Frequency.Monthly,
            active: true
        });

        emit SubscriptionCreated(nextSubscriptionId, name, description, msg.sender, baseAmount, token);

        nextSubscriptionId++;
    }


      function selectSubscription(
        uint256 subscriptionId,
        Frequency frequency
    ) external nonReentrant subscriptionExists(subscriptionId) {
        Subscription storage subscription = subscriptions[subscriptionId];
        require(subscription.active, "Subscription is inactive");

        uint256 amount = calculateCost(subscription.baseAmount, frequency);
        uint256 nextPaymentDue = block.timestamp + getInterval(frequency);

        IERC20(subscription.token).transferFrom(msg.sender, subscription.serviceProvider, amount);

        userSubscriptions[msg.sender].push(UserSubscription({
            subscriptionId: subscriptionId,
            nextPaymentDue: nextPaymentDue,
            amount: amount
        }));

        emit SubscriptionSelected(msg.sender, subscriptionId, amount, nextPaymentDue);
    }

    function calculateCost(uint256 baseAmount, Frequency frequency) public pure returns (uint256) {
        if (frequency == Frequency.Monthly) {
            return baseAmount;
        } else if (frequency == Frequency.Quarterly) {
            return baseAmount * 3;
        } else if (frequency == Frequency.HalfYearly) {
            return baseAmount * 6;
        } else if (frequency == Frequency.Annually) {
            return baseAmount * 12;
        }
        return 0;
    }

    function getInterval(Frequency frequency) public pure returns (uint256) {
        if (frequency == Frequency.Monthly) {
            return 30 days;
        } else if (frequency == Frequency.Quarterly) {
            return 90 days;
        } else if (frequency == Frequency.HalfYearly) {
            return 180 days;
        } else if (frequency == Frequency.Annually) {
            return 365 days;
        }
        return 0;
    }

    function getAllSubscriptions() external view returns (Subscription[] memory) {
        Subscription[] memory allSubscriptions = new Subscription[](nextSubscriptionId - 1);
        for (uint256 i = 1; i < nextSubscriptionId; i++) {
            allSubscriptions[i - 1] = subscriptions[i];
        }
        return allSubscriptions;
    }

    function getUserSubscriptions(address user) external view returns (UserSubscription[] memory) {
        return userSubscriptions[user];
    }

    function getSubscriptionDetails(uint256 subscriptionId)
        external
        view
        subscriptionExists(subscriptionId)
        returns (
            string memory name,
            string memory description,
            address serviceProvider,
            uint256 baseAmount,
            address token,
            bool active
        )
    {
        Subscription storage subscription = subscriptions[subscriptionId];
        return (
            subscription.name,
            subscription.description,
            subscription.serviceProvider,
            subscription.baseAmount,
            subscription.token,
            subscription.active
        );
    }


    

    function createGroup(string calldata name, address[] calldata members) external nonReentrant {
        require(members.length > 0, "Group must have at least one member");

        Group storage group = groups[nextGroupId];
        group.id = nextGroupId;
        group.name = name;
        group.members = members;
        group.active = true;

        emit GroupCreated(nextGroupId, name, members);
        nextGroupId++;
    }


    function addExpense(uint256 groupId, uint256 amount, address token) external nonReentrant groupExists(groupId) onlyMember(groupId) {
        Group storage group = groups[groupId];
        require(amount > 0, "Amount must be greater than zero");

        IERC20(token).transferFrom(msg.sender, address(this), amount);
        group.payments[msg.sender] += amount;
        group.totalPayments += amount;

        group.expenses[msg.sender].push(Transaction({
            sender: msg.sender,
            receiver: address(this),
            amount: amount,
            token: token,
            timestamp: block.timestamp
        }));

        emit ExpenseAdded(groupId, msg.sender, amount);
    }


    
    function getUserExpenses(uint256 groupId, address user) external view groupExists(groupId) returns (Transaction[] memory) {
        return groups[groupId].expenses[user];
    } 
    function getAllGroups() external view returns (uint256[] memory, string[] memory, uint256[] memory, bool[] memory) {
        uint256 count = nextGroupId - 1;

        uint256[] memory ids = new uint256[](count);
        string[] memory names = new string[](count);
        uint256[] memory totalPayments = new uint256[](count);
        bool[] memory activeStatuses = new bool[](count);

        for (uint256 i = 1; i <= count; i++) {
            Group storage group = groups[i];
            ids[i - 1] = group.id;
            names[i - 1] = group.name;
            totalPayments[i - 1] = group.totalPayments;
            activeStatuses[i - 1] = group.active;
        }

        return (ids, names, totalPayments, activeStatuses);
    }


   

  

 



    


    function getGroupMembers(uint256 groupId) external view groupExists(groupId) returns (address[] memory) {
        return groups[groupId].members;
    }

    function getGroupPayments(uint256 groupId, address member) external view groupExists(groupId) returns (uint256) {
        return groups[groupId].payments[member];
    }

    function getGroupDetails(uint256 groupId)
        external
        view
        groupExists(groupId)
        returns (uint256 id, string memory name, address[] memory members, uint256 totalPayments, bool active)
    {
        Group storage group = groups[groupId];
        return (group.id, group.name, group.members, group.totalPayments, group.active);
    }

    
}
