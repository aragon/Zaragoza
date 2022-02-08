import {assert, clearStore, test} from 'matchstick-as/assembly/index';
import {Address} from '@graphprotocol/graph-ts';
import {
  createNewSetMetadataEvent,
  createNewETHDepositedEvent,
  createNewDepositedEvent,
  createNewWithdrawnEvent,
  getTokenInfo,
  getBalanceOf
} from './utils';
import {
  daoAddress,
  addressOne,
  daiAddress,
  oneEth,
  dataString,
  halfEth,
  addressZero
} from '../constants';
import {runHandleNewDAORegistered} from '../registry/utils';
import {
  handleSetMetadata,
  handleETHDeposited,
  handleDeposited,
  handleWithdrawn
} from '../../src/dao';

test('Run dao (handleSetMetadata) mappings with mock event', () => {
  // create event and run it's handler
  runHandleNewDAORegistered(daoAddress, addressOne, daiAddress, 'mock-Dao');

  let entityID = Address.fromString(daoAddress).toHexString();

  // create event
  let newDaoEvent = createNewSetMetadataEvent('new-metadata', daoAddress);

  // handle event
  handleSetMetadata(newDaoEvent);

  // checks
  assert.fieldEquals('Dao', entityID, 'id', entityID);
  assert.fieldEquals('Dao', entityID, 'metadata', 'new-metadata');

  clearStore();
});

test('Run dao (handleETHDeposited) mappings with mock event', () => {
  // create event and run it's handler
  runHandleNewDAORegistered(daoAddress, addressOne, daiAddress, 'mock-Dao');

  // create event
  let newEvent = createNewETHDepositedEvent(addressOne, oneEth, daoAddress);

  let entityID =
    Address.fromString(daoAddress).toHexString() +
    '_' +
    newEvent.transaction.hash.toHexString() +
    '_' +
    newEvent.transactionLogIndex.toHexString();

  // handle event
  handleETHDeposited(newEvent);

  // checks
  assert.fieldEquals('VaultDeposit', entityID, 'id', entityID);
  assert.fieldEquals('VaultDeposit', entityID, 'sender', addressOne);
  assert.fieldEquals('VaultDeposit', entityID, 'amount', oneEth);

  clearStore();
});

test('Run dao (handleDeposited) mappings with mock event', () => {
  // create event and run it's handler
  runHandleNewDAORegistered(daoAddress, addressOne, daiAddress, 'mock-Dao');

  // create event
  let newEvent = createNewDepositedEvent(
    addressOne,
    daiAddress,
    oneEth,
    dataString,
    daoAddress
  );

  let entityID =
    Address.fromString(daoAddress).toHexString() +
    '_' +
    newEvent.transaction.hash.toHexString() +
    '_' +
    newEvent.transactionLogIndex.toHexString();

  getTokenInfo(daiAddress, 'Dai Token', 'DAI', '18');
  getBalanceOf(daiAddress, daoAddress, halfEth);
  // handle event
  handleDeposited(newEvent);

  // check token
  assert.fieldEquals(
    'ERC20Token',
    Address.fromString(daiAddress).toHexString(),
    'id',
    Address.fromString(daiAddress).toHexString()
  );
  assert.fieldEquals(
    'ERC20Token',
    Address.fromString(daiAddress).toHexString(),
    'name',
    'Dai Token'
  );
  assert.fieldEquals(
    'ERC20Token',
    Address.fromString(daiAddress).toHexString(),
    'decimals',
    '18'
  );
  // check balance
  assert.fieldEquals(
    'ERC20Balance',
    Address.fromString(daoAddress).toHexString() +
      '_' +
      Address.fromString(daiAddress).toHexString(),
    'id',
    Address.fromString(daoAddress).toHexString() +
      '_' +
      Address.fromString(daiAddress).toHexString()
  );
  assert.fieldEquals(
    'ERC20Balance',
    Address.fromString(daoAddress).toHexString() +
      '_' +
      Address.fromString(daiAddress).toHexString(),
    'token',
    Address.fromString(daiAddress).toHexString()
  );
  assert.fieldEquals(
    'ERC20Balance',
    Address.fromString(daoAddress).toHexString() +
      '_' +
      Address.fromString(daiAddress).toHexString(),
    'dao',
    Address.fromString(daoAddress).toHexString()
  );
  assert.fieldEquals(
    'ERC20Balance',
    Address.fromString(daoAddress).toHexString() +
      '_' +
      Address.fromString(daiAddress).toHexString(),
    'balance',
    halfEth
  );
  // checks Deposit
  assert.fieldEquals('VaultDeposit', entityID, 'id', entityID);
  assert.fieldEquals(
    'VaultDeposit',
    entityID,
    'dao',
    Address.fromString(daoAddress).toHexString()
  );
  assert.fieldEquals('VaultDeposit', entityID, 'sender', addressOne);
  assert.fieldEquals(
    'VaultDeposit',
    entityID,
    'token',
    Address.fromString(daiAddress).toHexString()
  );
  assert.fieldEquals('VaultDeposit', entityID, 'amount', oneEth);
  assert.fieldEquals('VaultDeposit', entityID, 'reference', dataString);

  clearStore();
});

test('Run dao (handleWithdrawn) mappings with mock event', () => {
  // create event and run it's handler
  runHandleNewDAORegistered(daoAddress, addressOne, daiAddress, 'mock-Dao');

  // create event
  let newEvent = createNewWithdrawnEvent(
    daiAddress,
    addressOne,
    oneEth,
    dataString,
    daoAddress
  );

  let entityID =
    Address.fromString(daoAddress).toHexString() +
    '_' +
    newEvent.transaction.hash.toHexString() +
    '_' +
    newEvent.transactionLogIndex.toHexString();

  // handle event
  handleWithdrawn(newEvent);

  // checks
  assert.fieldEquals('VaultWithdraw', entityID, 'id', entityID);
  assert.fieldEquals(
    'VaultWithdraw',
    entityID,
    'dao',
    Address.fromString(daoAddress).toHexString()
  );
  assert.fieldEquals(
    'VaultWithdraw',
    entityID,
    'token',
    Address.fromString(daiAddress).toHexString()
  );
  assert.fieldEquals('VaultWithdraw', entityID, 'to', addressOne);
  assert.fieldEquals('VaultWithdraw', entityID, 'amount', oneEth);
  assert.fieldEquals('VaultWithdraw', entityID, 'reference', dataString);

  clearStore();
});

test('Run dao (handleETHDeposited and handleWithdrawn for ETH)', () => {
  // create event and run it's handler
  runHandleNewDAORegistered(daoAddress, addressOne, daiAddress, 'mock-Dao');
  // deposit Eth
  // create and handle deposit event
  let newDepositEvent = createNewETHDepositedEvent(
    addressOne,
    oneEth,
    daoAddress
  );
  handleETHDeposited(newDepositEvent);

  // check balance
  assert.fieldEquals(
    'ERC20Balance',
    Address.fromString(daoAddress).toHexString() +
      '_' +
      Address.fromString(addressZero).toHexString(),
    'balance',
    oneEth
  );

  // create event
  let newEvent = createNewWithdrawnEvent(
    addressZero,
    addressOne,
    halfEth,
    dataString,
    daoAddress
  );

  let entityID =
    Address.fromString(daoAddress).toHexString() +
    '_' +
    newEvent.transaction.hash.toHexString() +
    '_' +
    newEvent.transactionLogIndex.toHexString();

  // handle event
  handleWithdrawn(newEvent);

  // checks withdraw
  assert.fieldEquals('VaultWithdraw', entityID, 'id', entityID);
  assert.fieldEquals('VaultWithdraw', entityID, 'amount', halfEth);
  // check balance again
  // check balance
  assert.fieldEquals(
    'ERC20Balance',
    Address.fromString(daoAddress).toHexString() +
      '_' +
      Address.fromString(addressZero).toHexString(),
    'balance',
    halfEth
  );

  clearStore();
});

test('Run dao (handleDeposite and handleWithdrawn for token)', () => {
  // create event and run it's handler
  runHandleNewDAORegistered(daoAddress, addressOne, daiAddress, 'mock-Dao');

  // create event
  let newDepositEvent = createNewDepositedEvent(
    addressOne,
    daiAddress,
    oneEth,
    dataString,
    daoAddress
  );

  getTokenInfo(daiAddress, 'Dai Token', 'DAI', '18');
  getBalanceOf(daiAddress, daoAddress, oneEth);
  // handle event
  handleDeposited(newDepositEvent);

  assert.fieldEquals(
    'ERC20Balance',
    Address.fromString(daoAddress).toHexString() +
      '_' +
      Address.fromString(daiAddress).toHexString(),
    'balance',
    oneEth
  );

  // create event
  let newWithdrawEvent = createNewWithdrawnEvent(
    daiAddress,
    addressOne,
    halfEth,
    dataString,
    daoAddress
  );

  getBalanceOf(daiAddress, daoAddress, halfEth);
  // handle event
  handleWithdrawn(newWithdrawEvent);

  assert.fieldEquals(
    'ERC20Balance',
    Address.fromString(daoAddress).toHexString() +
      '_' +
      Address.fromString(daiAddress).toHexString(),
    'balance',
    halfEth
  );

  clearStore();
});
