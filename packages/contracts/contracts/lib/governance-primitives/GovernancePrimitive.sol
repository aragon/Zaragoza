/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "../../src/permissions/Permissions.sol";
import "../../src/processes/Processes.sol";
import "../../src/executor/Executor.sol";
import "../../src/DAO.sol";
import "../Component.sol";

/// @title Abstract implementation of the governance primitive
/// @author Samuel Furter - Aragon Association - 2021
/// @notice This contract can be used to implement concrete stoppable governance primitives and being fully compatible with the DAO framework and UI of Aragon
/// @dev You only have to define the specific custom logic for your needs in _start, _execute, and _stop
abstract contract GovernancePrimitive is Component {
    event GovernancePrimitiveStarted(Execution indexed execution, uint256 indexed executionId);
    event GovernancePrimitiveExecuted(Execution indexed execution, uint256 indexed executionId);

    // The states a execution can have
    enum State {
        RUNNING, 
        STOPPED,
        HALTED,
        EXECUTED
    }

    struct Proposal {
        string processName; // The hash of the process that should get called
        Executor.Action[] actions; // The actions that should get executed in the end
        bytes metadata; // IPFS hash pointing to the metadata as description, title, image etc. 
        bytes additionalArguments; // Optional additional arguments a process resp. governance primitive does need
    }

    struct Execution { // A execution contains the process to execute, the proposal passed by the user, and the state of the execution.
        uint256 id;
        Processes.Process process;
        Proposal proposal;
        State state;
    }

    uint256 private executionsCounter;
    mapping(uint256 => Execution) private executions;

    string private constant ERROR_NO_EXECUTION = "ERROR_NO_EXECUTION";

    modifier executionExist(uint256 _id) {
        require(_id < executionsCounter, ERROR_NO_EXECUTION);
        _;
    }

    /// @notice If called the governance primitive starts a new execution.
    /// @dev The state of the container does get changed to RUNNING, the execution struct gets created, and the concrete implementation in _start called.
    /// @param process The process definition.
    /// @param proposal The proposal for execution submitted by the user.
    /// @return executionId The id of the newly created execution.
    function start(Processes.Process calldata process, Proposal calldata proposal) public returns (uint256 executionId) {
        require(
            Permissions(dao.permissions.address).checkPermission(
                process.permissions.start
            ),
            "Not allowed to start!"
        );

        executionsCounter++;

        // the reason behind this - https://matrix.to/#/!poXqlbVpQfXKWGseLY:gitter.im/$6IhWbfjcTqmLoqAVMopWFuIhlQwsoaIRxmsXhhmsaSs?via=gitter.im&via=matrix.org&via=ekpyron.org
        Execution storage execution = executions[executionsCounter];
        execution.id = executionsCounter;
        execution.process = process;
        execution.proposal = proposal;
        execution.state = State.RUNNING;

        Execution memory _execution = execution;

        _start(_execution); // "Hook" to add logic in start of a concrete implementation.

        emit GovernancePrimitiveStarted(execution, executionId);

        return executionsCounter;
    }
    
    /// @notice If called the proposed actions do get executed.
    /// @dev The state of the container does get changed to EXECUTED, the pre-execute method _execute does get called, and the actions executed.
    /// @param executionId The id of the execution struct.
    function execute(uint256 executionId) public {
        Execution storage execution = _getExecution(executionId);

        require(
            Permissions(dao.permissions.address).checkPermission(
                execution.process.permissions.execute
            ),
            "Not allowed to execute!"
        );
        
        _execute(execution); // "Hook" to add logic in execute of a concrete implementation

        Executor(dao.executor.address).execute(execution.proposal.actions);

        execution.state = State.EXECUTED;

        emit GovernancePrimitiveExecuted(execution, executionId);
    }

    /// @dev Internal helper and abstraction to get a execution struct.
    /// @param executionId The id of the execution struct.
    function _getExecution(uint256 executionId) internal view returns (Execution storage execution) {
        return executions[executionId];
    }

    /// @dev The concrete implementation of stop.
    /// @param execution The execution struct with all the informations needed.
    function _start(Execution memory execution) internal virtual;

    /// @dev The concrete pre-execution call.
    /// @param execution The execution struct with all the informations needed.
    function _execute(Execution memory execution) internal virtual;
}
