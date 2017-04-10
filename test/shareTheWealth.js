var ShareTheWealth = artifacts.require("./ShareTheWealth.sol");

// Found here https://gist.github.com/xavierlepretre/88682e871f4ad07be4534ae560692ee6
web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
    var transactionReceiptAsync;
    interval = interval ? interval : 500;
    transactionReceiptAsync = function(txnHash, resolve, reject) {
        web3.eth.getTransactionReceipt(txnHash, (error, receipt) => {
            if (error) {
                reject(error);
            } else {
                if (receipt == null) {
                    setTimeout(function () {
                        transactionReceiptAsync(txnHash, resolve, reject);
                    }, interval);
                } else {
                    resolve(receipt);
                }
            }
        });
    };

    if (Array.isArray(txnHash)) {
        var promises = [];
        txnHash.forEach(function (oneTxHash) {
            promises.push(web3.eth.getTransactionReceiptMined(oneTxHash, interval));
        });
        return Promise.all(promises);
    } else {
        return new Promise(function (resolve, reject) {
                transactionReceiptAsync(txnHash, resolve, reject);
            });
    }
};

contract('ShareTheWealth', function(accounts) {
    it("should create contract with owner", function() {
        return ShareTheWealth.deployed().then(function(instance) {
            return instance.owner.call();
        }).then(function(result) {
            assert.equal(result, accounts[0], "owner of contract should be account[0]");
        });
    });

    it("should allow owner to add beneficiary", function() {
        var shareTheWealthInstance;
        return ShareTheWealth.deployed().then(function(instance) {
            shareTheWealthInstance = instance;
            return shareTheWealthInstance.addBeneficiary(accounts[1], {from: accounts[0]});
        }).then(function(result) {
            return shareTheWealthInstance.numOfBeneficiaries.call();
        }).then(function(result) {
            assert.equal(result.valueOf(), 1, "should be 1 beneficiary");
            return shareTheWealthInstance.beneficiaries.call(0);
        }).then(function(result) {
            assert.equal(result, accounts[1], "should be account[1]");
        });
    });
});

contract('ShareTheWealth', function(accounts) {
    it("should allow address to share value to beneficiaries", function() {
        var shareTheWealthInstance;

        var contributionAmount = web3.toWei(2, "ether"); //2000000000000000000 // 2 Eth in wei

        var beneficiary1Balance = web3.eth.getBalance(accounts[1]).toNumber();
        var beneficiary2Balance = web3.eth.getBalance(accounts[2]).toNumber();

        return ShareTheWealth.deployed().then(function(instance) {
            shareTheWealthInstance = instance;
            return shareTheWealthInstance.addBeneficiary(accounts[1], {from: accounts[0]});
        }).then(function(result) {
            return shareTheWealthInstance.addBeneficiary(accounts[2], {from: accounts[0]});
        }).then(function(result) {
            return shareTheWealthInstance.numOfBeneficiaries.call();
        }).then(function(result) {
            assert.equal(result.valueOf(), 2, "should be 2 beneficiaries");
            return shareTheWealthInstance.shareValue({from: accounts[0], value: contributionAmount});
        }).then(function(result) {
            var expectedNewBalance = beneficiary1Balance + (contributionAmount / 2);
            var expected2NewBalance = beneficiary2Balance + (contributionAmount / 2);
            
            var beneficiary1EndBalance = web3.eth.getBalance(accounts[1]).toNumber();
            var beneficiary2EndBalance = web3.eth.getBalance(accounts[2]).toNumber();

            assert.equal(expectedNewBalance, beneficiary1EndBalance, "beneficiary balance should have increased by 1 Ether");
            assert.equal(expected2NewBalance, beneficiary2EndBalance, "beneficiary balance should have increased by 1 Ether");
        });
    });

    it("should return the correct beneficiary address", function() {
        return ShareTheWealth.deployed().then(function(instance) {
            return instance.getBeneficiary.call(0);
        }).then(function(result) {
            assert.equal(result, accounts[1], "address at index 0 should equal accounts[1]");
        });
    })
});