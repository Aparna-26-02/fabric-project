const grpc = require('@grpc/grpc-js');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const channelName = 'agrichannel';
const chaincodeName = 'agri';

async function getContract() {

    const cryptoPath = path.resolve(
        __dirname,
        '../../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com'
    );

    const keyDirectoryPath = path.resolve(
        cryptoPath,
        'users/User1@org1.example.com/msp/keystore'
    );

    const certPath = path.resolve(
        cryptoPath,
        'users/User1@org1.example.com/msp/signcerts/cert.pem'
    );

    const tlsCertPath = path.resolve(
        cryptoPath,
        'peers/peer0.org1.example.com/tls/ca.crt'
    );

    const keyFiles = fs.readdirSync(keyDirectoryPath);
    const privateKeyPath = path.resolve(keyDirectoryPath, keyFiles[0]);

    const tlsCredentials = grpc.credentials.createSsl(
        fs.readFileSync(tlsCertPath)
    );

    const client = new grpc.Client(
        'localhost:7051',
        tlsCredentials
    );

    const identity = {
        mspId: 'Org1MSP',
        credentials: fs.readFileSync(certPath),
    };

    const signer = signers.newPrivateKeySigner(
        crypto.createPrivateKey(fs.readFileSync(privateKeyPath))
    );

    const gateway = connect({
        client,
        identity,
        signer,
    });

    const network = gateway.getNetwork(channelName);
    return network.getContract(chaincodeName);
}

module.exports = { getContract };
