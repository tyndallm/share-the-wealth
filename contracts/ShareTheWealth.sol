pragma solidity ^0.4.4;

import 'zeppelin/lifecycle/Killable.sol';

contract ShareTheWealth is Killable{

    uint public numOfBeneficiaries;

    mapping (uint => address) public beneficiaries;

    function ShareTheWealth() {
        numOfBeneficiaries = 0;
    }

    function addBeneficiary(address _beneficiary) onlyOwner returns (bool added) {
        if (_beneficiary == address(0)) { // make sure address is valid
            throw;
        }

        beneficiaries[numOfBeneficiaries] = _beneficiary;
        numOfBeneficiaries++;
        return true;
    }

    function shareValue() payable returns (bool successful) {
        if (msg.value <= 0) { // must include value
            throw;
        }

        if (numOfBeneficiaries == 0) {
            throw;
        }

        uint amount = msg.value / numOfBeneficiaries;
        
        for (uint8 count = 0; count < numOfBeneficiaries; count++) {
            address currentBeneficiary = beneficiaries[count];
            if (!currentBeneficiary.send(amount)) { // if send fails for any beneficiary throw
                throw;
            }
        }

        return true;
    }

    function getBeneficiary(uint _index) returns (address beneficiary) {
        return beneficiaries[_index];
    }

    function() {
        throw; // don't allow blind sending to contract
    }

}