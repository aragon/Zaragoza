/*
 * SPDX-License-Identifier:    MIT
 */

pragma solidity 0.8.10;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "./../../component/Component.sol";
import "./../../executor/Executor.sol";
import "./../Processes.sol";
import "./../../DAO.sol";

/// @title Abstract implementation of the governance process
/// @author Samuel Furter - Aragon Association - 2021
/// @notice This contract can be used to implement concrete governance processes and being fully compatible with the DAO framework and UI of Aragon
/// @dev You only have to define the specific custom logic for your needs in _start, _execute, and _stop
abstract contract Process is Component {
    event ProcessStarted(Execution indexed execution, uint256 indexed executionId);
    event ProcessExecuted(Execution indexed execution, uint256 indexed executionId);

    // Roles
    bytes32 public constant PROCESS_START_ROLE = keccak256("PROCESS_START_ROLE");
    bytes32 public constant PROCESS_EXECUTE_ROLE = keccak256("PROCESS_EXECUTE_ROLE");

    // Error MSG's
    string internal constant ERROR_EXECUTION_STATE_WRONG = "ERROR_EXECUTION_STATE_WRONG";
    string internal constant ERROR_NOT_ALLOWED_TO_EXECUTE = "ERROR_NOT_ALLOWED_TO_EXECUTE";
    string internal constant ERROR_NOT_ALLOWED_TO_START = "ERROR_NOT_ALLOWED_TO_START";
    string internal constant ERROR_NO_EXECUTION = "ERROR_NO_EXECUTION";
    
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
        bytes additionalArguments; // Optional additional arguments a process resp. governance process does need
    }

    struct Execution { // A execution contains the process to execute, the proposal passed by the user, and the state of the execution.
        uint256 id;
        Proposal proposal;
        State state;
    }

    uint256 private executionsCounter;
    mapping(uint256 => Execution) private executions;

    /// @notice If called the governance process starts a new execution.
    /// @dev The state of the container does get changed to RUNNING, the execution struct gets created, and the concrete implementation in _start called.
    /// @param proposal The proposal for execution submitted by the user.
    /// @return executionId The id of the newly created execution.
    function start(Proposal calldata proposal) 
        external 
        auth(PROCESS_START_ROLE) 
        returns (uint256 executionId) 
    {
        executionsCounter++;

        // the reason behind this - https://matrix.to/#/!poXqlbVpQfXKWGseLY:gitter.im/$6IhWbfjcTqmLoqAVMopWFuIhlQwsoaIRxmsXhhmsaSs?via=gitter.im&via=matrix.org&via=ekpyron.org
        Execution storage execution = executions[executionsCounter];
        execution.id = executionsCounter;
        execution.process = process;
        execution.proposal = proposal;
        execution.state = State.RUNNING;

        Execution memory _execution = execution;

        _start(_execution); // "Hook" to add logic in start of a concrete implementation.

        emit ProcessStarted(execution, executionId);

        return executionsCounter;
    }
    
    /// @notice If called the proposed actions do get executed.
    /// @dev The state of the container does get changed to EXECUTED, the pre-execute method _execute does get called, and the actions executed.
    /// @param executionId The id of the execution struct.
    function execute(uint256 executionId) public auth(PROCESS_EXECUTE_ROLE) {
        Execution storage execution = _getExecution(executionId);
        
        require(execution.state == State.RUNNING, ERROR_EXECUTION_STATE_WRONG);
        
        execution.state = State.EXECUTED;

        _execute(execution); // "Hook" to add logic in execute of a concrete implementation

        // Executor(dao.executor.address).execute(execution.proposal.actions);

        emit ProcessExecuted(execution, executionId);
    }

    /// @dev Internal helper and abstraction to get a execution struct.
    /// @param executionId The id of the execution struct.
    /// @return execution The execution struct with all his properties.
    function _getExecution(uint256 executionId) internal view returns (Execution storage execution) {
        require(_id < executionsCounter, ERROR_NO_EXECUTION);

        return executions[executionId];
    }

    /// @dev The concrete implementation of stop.
    /// @param execution The execution struct with all the informations needed.
    function _start(Execution memory execution) internal virtual;

    /// @dev The concrete pre-execution call.
    /// @param execution The execution struct with all the informations needed.
    function _execute(Execution memory execution) internal virtual;
}
