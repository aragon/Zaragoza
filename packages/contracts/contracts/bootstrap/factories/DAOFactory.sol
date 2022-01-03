/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity 0.8.10;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "./../../packages/processes/votings/simple/SimpleVoting.sol";
import "./../../packages/tokens/GovernanceWrappedERC20.sol";
import "./../../packages/tokens/GovernanceERC20.sol";
import "./../../core/processes/Processes.sol";
import "./../../core/executor/Executor.sol";
//import "./../../packages/vault/Vault.sol";
import "./../registry/Registry.sol";
import "./../../core/DAO.sol";


// TODO: Change this to DAOFactory and ProcessFactory. Vault can get removed cause Executor has to be Vault+Executor.
contract DAOFactory {
    using Address for address;
    
    address private daoBase;
    address private processesBase;
    address private executorBase;

    Registry private registry;
    TokenFactory private tokenFactory;
    ProcessFactory private processFactory;

    constructor(
        Registry _registry, 
        TokenFactory _tokenFactory, 
        ProcessFactory _processFactory
    ) {
        registry = _registry;
        tokenFactory = _tokenFactory;
        processFactory = _processFactory;
    }

    function newDAO(
        bytes calldata _metadata,
        TokenConfig calldata _tokenConfig,
        uint256[3] calldata _processSettings,
        uint256[3] calldata _vaultSettings
    ) external returns (DAO dao, Processes processes, Executor executor) {
        // Create token or wrap token
        address token = tokenFactory.newToken(_tokenConfig);

        // Creates necessary contracts for dao.
        DAO dao = DAO(createProxy(daoBase, bytes("")));
        address processes = createProxy(processesBase, abi.encodeWithSelector(processes.initialize.selector, dao));
        address executor = createProxy(executorBase, abi.encodeWithSelector(executor.initialize.selector, dao));
        
        dao.initialize(
            _metadata,
            Processes(processes),
            Executor(executor)
        );

        // Set up base DAO contracts permissions
        // The below line means that on any contract's function that has UPGRADE_ROLE, executor will be able to call it.
        dao.grant(address(type(uint160).max), executor, Executor(executor).UPGRADE_ROLE()); // TODO: we can bring address(type(uint160).max) from ACL for consistency.
        // processes permissions
        dao.grant(processes, address(dao), Processes(processes).PROCESSES_START_ROLE());
        dao.grant(processes, address(dao), Processes(processes).PROCESSES_SET_ROLE());
        // dao permissions
        dao.grant(address(dao), executor, dao.DAO_CONFIG_ROLE());


        // Create process
        address process = processFactory.newProcess(_processSettings);
        // Process permissions on Executor permissions
        dao.grant(executor, process, Executor(executor).EXEC_ROLE());
        // Process permissions
        dao.grant(process, processes, Process(voting).PROCESS_START_ROLE());
        dao.grant(process, address(dao), Process(voting).PROCESS_EXECUTE_ROLE());
        dao.grant(process, executor, Process(voting).MODIFY_SUPPORT_ROLE());
        dao.grant(process, executor, Process(voting).MODIFY_QUORUM_ROLE());
    }

    function setupBases() internal override {
        daoBase = address(new DAO());
        processesBase = address(new Processes());
        executorBase = address(new Executor());
    }
}

