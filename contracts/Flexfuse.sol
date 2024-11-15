// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FlexFuse is ReentrancyGuard {
    struct Subscription {
        address serviceProvider;
        uint256 amount;
        address token;
        uint256 startTime;
        uint256 interval;
        bool active;
    }

    struct Group {
        address[] members;
        mapping(address => uint256) payments;
        uint256 totalPayments;
        bool active;
    }

    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        address token;
        uint256 timestamp;
    }

    mapping(bytes32 => Subscription) public subscriptions;
    mapping(bytes32 => Group) public groups;
    mapping(address => Transaction[]) public transactionLogs;

    event SubscriptionCreated(
        bytes32 indexed subscriptionId,
        address indexed serviceProvider,
        address token,
        uint256 amount,
        uint256 startTime,
        uint256 interval
    );

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

    event PaymentAdded(bytes32 indexed groupId, address indexed member, uint256 amount);
    event PaymentWithdrawn(bytes32 indexed groupId, address indexed member, uint256 amount);
    event PaymentReleased(bytes32 indexed subscriptionId, uint256 amount, uint256 timestamp);
    event MemberRemoved(bytes32 indexed groupId, address indexed member);
    event GroupCreated(bytes32 indexed groupId, address[] members);
    event GroupDeactivated(bytes32 indexed groupId);

    modifier onlyMember(bytes32 groupId) {
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

    modifier subscriptionExists(bytes32 subscriptionId) {
        require(subscriptions[subscriptionId].serviceProvider != address(0), "Subscription does not exist");
        _;
    }

    modifier groupExists(bytes32 groupId) {
        require(groups[groupId].active, "Group does not exist or is inactive");
        _;
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
        bytes32 subscriptionId,
        address serviceProvider,
        uint256 amount,
        address token,
        uint256 startTime,
        uint256 interval
    ) external nonReentrant {
        require(subscriptions[subscriptionId].serviceProvider == address(0), "Subscription already exists");
        subscriptions[subscriptionId] = Subscription({
            serviceProvider: serviceProvider,
            amount: amount,
            token: token,
            startTime: startTime,
            interval: interval,
            active: true
        });

        emit SubscriptionCreated(subscriptionId, serviceProvider, token, amount, startTime, interval);
    }

    function updateSubscription(
        bytes32 subscriptionId,
        uint256 newAmount,
        uint256 newInterval
    ) external nonReentrant subscriptionExists(subscriptionId) {
        Subscription storage subscription = subscriptions[subscriptionId];
        subscription.amount = newAmount;
        subscription.interval = newInterval;

        emit SubscriptionUpdated(subscriptionId, newAmount, newInterval);
    }

    function createGroup(bytes32 groupId, address[] calldata members) external nonReentrant {
        require(groups[groupId].members.length == 0, "Group already exists");
        for (uint256 i = 0; i < members.length; i++) {
            groups[groupId].members.push(members[i]);
        }
        groups[groupId].active = true;

        emit GroupCreated(groupId, members);
    }

    function addPayment(
        bytes32 groupId,
        uint256 amount,
        address token
    ) external nonReentrant groupExists(groupId) onlyMember(groupId) {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        groups[groupId].payments[msg.sender] += amount;
        groups[groupId].totalPayments += amount;

        emit PaymentAdded(groupId, msg.sender, amount);
    }

    function withdrawPayment(
        bytes32 groupId,
        uint256 amount,
        address token
    ) external nonReentrant groupExists(groupId) onlyMember(groupId) {
        Group storage group = groups[groupId];
        require(group.payments[msg.sender] >= amount, "Insufficient payment balance");

        group.payments[msg.sender] -= amount;
        group.totalPayments -= amount;
        IERC20(token).transfer(msg.sender, amount);

        emit PaymentWithdrawn(groupId, msg.sender, amount);
    }

    function removeMember(bytes32 groupId, address member) external nonReentrant groupExists(groupId) {
        Group storage group = groups[groupId];
        bool removed = false;

        for (uint256 i = 0; i < group.members.length; i++) {
            if (group.members[i] == member) {
                group.members[i] = group.members[group.members.length - 1];
                group.members.pop();
                removed = true;
                break;
            }
        }
        require(removed, "Member not found in the group");

        uint256 memberBalance = group.payments[member];
        group.totalPayments -= memberBalance;

        if (memberBalance > 0) {
            IERC20(group.members[0]).transfer(member, memberBalance); // Assuming token[0] for refunds.
        }

        emit MemberRemoved(groupId, member);
    }

    function deactivateGroup(bytes32 groupId) external nonReentrant groupExists(groupId) {
        groups[groupId].active = false;

        emit GroupDeactivated(groupId);
    }

    function releasePayment(bytes32 subscriptionId, bytes32 groupId) external nonReentrant {
        Subscription storage subscription = subscriptions[subscriptionId];
        require(subscription.active, "Subscription is not active");
        require(
            block.timestamp >= subscription.startTime &&
                (block.timestamp - subscription.startTime) % subscription.interval == 0,
            "Not time for payment"
        );

        Group storage group = groups[groupId];
        require(group.totalPayments >= subscription.amount, "Insufficient funds in group");

        IERC20(subscription.token).transfer(subscription.serviceProvider, subscription.amount);
        group.totalPayments -= subscription.amount;

        emit PaymentReleased(subscriptionId, subscription.amount, block.timestamp);
    }

    function checkSubscriptionDue(bytes32 subscriptionId) external view subscriptionExists(subscriptionId) returns (bool) {
        Subscription storage subscription = subscriptions[subscriptionId];
        return (block.timestamp >= subscription.startTime &&
            (block.timestamp - subscription.startTime) % subscription.interval == 0);
    }

    function getGroupMembers(bytes32 groupId) external view groupExists(groupId) returns (address[] memory) {
        return groups[groupId].members;
    }

    function getGroupPayments(bytes32 groupId, address member) external view groupExists(groupId) returns (uint256) {
        return groups[groupId].payments[member];
    }

    function getGroupDetails(bytes32 groupId) 
        external 
        view 
        groupExists(groupId) 
        returns (address[] memory members, uint256 totalPayments) 
    {
        return (groups[groupId].members, groups[groupId].totalPayments);
    }

    function getSubscriptionDetails(bytes32 subscriptionId) 
        external 
        view 
        subscriptionExists(subscriptionId) 
        returns (
            address serviceProvider,
            uint256 amount,
            address token,
            uint256 startTime,
            uint256 interval,
            bool active
        ) 
    {
        Subscription storage sub = subscriptions[subscriptionId];
        return (sub.serviceProvider, sub.amount, sub.token, sub.startTime, sub.interval, sub.active);
    }
}
