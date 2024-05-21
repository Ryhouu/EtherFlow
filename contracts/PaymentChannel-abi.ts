export const PaymentChannelABI = [
    {
        "inputs":[{"internalType":"address payable","name":"recipientAddress","type":"address"},{"internalType":"uint256","name":"duration","type":"uint256"}],
        "stateMutability":"payable",
        "type":"constructor"
    },
    {
        "inputs":[],
        "name":"claimTimeout",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },
    {
        "inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"bytes","name":"signature","type":"bytes"}],
        "name":"close",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },
    {
        "inputs":[],
        "name":"expiration",
        "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
        "stateMutability":"view",
        "type":"function"
    },
    {
        "inputs":[{"internalType":"uint256","name":"newExpiration","type":"uint256"}],
        "name":"extend",
        "outputs":[],
        "stateMutability":"nonpayable",
        "type":"function"
    },
    {
        "inputs":[],
        "name":"recipient",
        "outputs":[{"internalType":"address payable","name":"","type":"address"}],
        "stateMutability":"view",
        "type":"function"},
    {
        "inputs":[],
        "name":"sender",
        "outputs":[{"internalType":"address payable","name":"","type":"address"}],
        "stateMutability":"view",
        "type":"function"
    }
];