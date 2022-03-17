/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity 0.8.10;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";
import "@opengsn/contracts/src/interfaces/IRelayRecipient.sol";

import "./../IDAO.sol";

interface Relay {
    function trustedForwarder() external virtual view returns (address);
}

/// @title Abstract implementation of the DAO permissions
/// @author Samuel Furter - Aragon Association - 2022
/// @notice This contract can be used to include the modifier logic(so contracts don't repeat the same code) that checks permissions on the dao.
/// @dev When your contract inherits from this, it's important to call __Permission_init with the dao address.
abstract contract Permissions is Initializable, BaseRelayRecipient {
    
    /// @dev Every component needs DAO at least for the permission management. See 'auth' modifier.
    IDAO internal dao;
    
    /// @dev Auth modifier used in all components of a DAO to check the permissions.
    /// @param _role The hash of the role identifier
    modifier auth(bytes32 _role)  {
        require(dao.hasPermission(address(this), _msgSender(), _role, _msgData()), "component: auth");
        _;
    }

    function __Permission_init(IDAO _dao) internal virtual initializer {
        dao = _dao;
    }

    function isTrustedForwarder(address _forwarder) public virtual override view returns(bool) {
        address forwarder = trustedForwarder();

        if(forwarder == address(0)) {
            forwarder = Relay(address(dao)).trustedForwarder();
        }

        return forwarder == _forwarder;
    }
}
