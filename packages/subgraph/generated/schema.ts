// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class CustomEntity extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("name", Value.fromString(""));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save CustomEntity entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save CustomEntity entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("CustomEntity", id.toString(), this);
    }
  }

  static load(id: string): CustomEntity | null {
    return changetype<CustomEntity | null>(store.get("CustomEntity", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get name(): string {
    let value = this.get("name");
    return value!.toString();
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }
}

export class Permission extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("validators", Value.fromBytesArray(new Array(0)));
    this.set("data", Value.fromBytesArray(new Array(0)));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Permission entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Permission entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Permission", id.toString(), this);
    }
  }

  static load(id: string): Permission | null {
    return changetype<Permission | null>(store.get("Permission", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get Operator(): string | null {
    let value = this.get("Operator");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set Operator(value: string | null) {
    if (!value) {
      this.unset("Operator");
    } else {
      this.set("Operator", Value.fromString(<string>value));
    }
  }

  get validators(): Array<Bytes> {
    let value = this.get("validators");
    return value!.toBytesArray();
  }

  set validators(value: Array<Bytes>) {
    this.set("validators", Value.fromBytesArray(value));
  }

  get data(): Array<Bytes> {
    let value = this.get("data");
    return value!.toBytesArray();
  }

  set data(value: Array<Bytes>) {
    this.set("data", Value.fromBytesArray(value));
  }
}

export class Role extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("permission", Value.fromString(""));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Role entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Role entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Role", id.toString(), this);
    }
  }

  static load(id: string): Role | null {
    return changetype<Role | null>(store.get("Role", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get role(): string | null {
    let value = this.get("role");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set role(value: string | null) {
    if (!value) {
      this.unset("role");
    } else {
      this.set("role", Value.fromString(<string>value));
    }
  }

  get permission(): string {
    let value = this.get("permission");
    return value!.toString();
  }

  set permission(value: string) {
    this.set("permission", Value.fromString(value));
  }
}

export class AllowedActions extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("to", Value.fromBytes(Bytes.empty()));
    this.set("methods", Value.fromBytesArray(new Array(0)));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save AllowedActions entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save AllowedActions entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("AllowedActions", id.toString(), this);
    }
  }

  static load(id: string): AllowedActions | null {
    return changetype<AllowedActions | null>(store.get("AllowedActions", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get to(): Bytes {
    let value = this.get("to");
    return value!.toBytes();
  }

  set to(value: Bytes) {
    this.set("to", Value.fromBytes(value));
  }

  get methods(): Array<Bytes> {
    let value = this.get("methods");
    return value!.toBytesArray();
  }

  set methods(value: Array<Bytes>) {
    this.set("methods", Value.fromBytesArray(value));
  }
}

export class Action extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("to", Value.fromBytes(Bytes.empty()));
    this.set("value", Value.fromBigInt(BigInt.zero()));
    this.set("data", Value.fromBytes(Bytes.empty()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Action entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Action entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Action", id.toString(), this);
    }
  }

  static load(id: string): Action | null {
    return changetype<Action | null>(store.get("Action", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get to(): Bytes {
    let value = this.get("to");
    return value!.toBytes();
  }

  set to(value: Bytes) {
    this.set("to", Value.fromBytes(value));
  }

  get value(): BigInt {
    let value = this.get("value");
    return value!.toBigInt();
  }

  set value(value: BigInt) {
    this.set("value", Value.fromBigInt(value));
  }

  get data(): Bytes {
    let value = this.get("data");
    return value!.toBytes();
  }

  set data(value: Bytes) {
    this.set("data", Value.fromBytes(value));
  }
}

export class Proposal extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("processName", Value.fromString(""));
    this.set("actions", Value.fromStringArray(new Array(0)));
    this.set("metadata", Value.fromBytes(Bytes.empty()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Proposal entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Proposal entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Proposal", id.toString(), this);
    }
  }

  static load(id: string): Proposal | null {
    return changetype<Proposal | null>(store.get("Proposal", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get processName(): string {
    let value = this.get("processName");
    return value!.toString();
  }

  set processName(value: string) {
    this.set("processName", Value.fromString(value));
  }

  get actions(): Array<string> {
    let value = this.get("actions");
    return value!.toStringArray();
  }

  set actions(value: Array<string>) {
    this.set("actions", Value.fromStringArray(value));
  }

  get metadata(): Bytes {
    let value = this.get("metadata");
    return value!.toBytes();
  }

  set metadata(value: Bytes) {
    this.set("metadata", Value.fromBytes(value));
  }

  get additionalArguments(): Bytes | null {
    let value = this.get("additionalArguments");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set additionalArguments(value: Bytes | null) {
    if (!value) {
      this.unset("additionalArguments");
    } else {
      this.set("additionalArguments", Value.fromBytes(<Bytes>value));
    }
  }
}

export class Process extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("name", Value.fromString(""));
    this.set("governancePrimitive", Value.fromBytes(Bytes.empty()));
    this.set("permissions", Value.fromString(""));
    this.set("allowedActions", Value.fromStringArray(new Array(0)));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Process entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Process entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Process", id.toString(), this);
    }
  }

  static load(id: string): Process | null {
    return changetype<Process | null>(store.get("Process", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get name(): string {
    let value = this.get("name");
    return value!.toString();
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get governancePrimitive(): Bytes {
    let value = this.get("governancePrimitive");
    return value!.toBytes();
  }

  set governancePrimitive(value: Bytes) {
    this.set("governancePrimitive", Value.fromBytes(value));
  }

  get permissions(): string {
    let value = this.get("permissions");
    return value!.toString();
  }

  set permissions(value: string) {
    this.set("permissions", Value.fromString(value));
  }

  get allowedActions(): Array<string> {
    let value = this.get("allowedActions");
    return value!.toStringArray();
  }

  set allowedActions(value: Array<string>) {
    this.set("allowedActions", Value.fromStringArray(value));
  }

  get metadata(): Bytes | null {
    let value = this.get("metadata");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set metadata(value: Bytes | null) {
    if (!value) {
      this.unset("metadata");
    } else {
      this.set("metadata", Value.fromBytes(<Bytes>value));
    }
  }

  get executionId(): BigInt | null {
    let value = this.get("executionId");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set executionId(value: BigInt | null) {
    if (!value) {
      this.unset("executionId");
    } else {
      this.set("executionId", Value.fromBigInt(<BigInt>value));
    }
  }
}

export class VaultTransfer extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("to", Value.fromBytes(Bytes.empty()));
    this.set("amount", Value.fromBigInt(BigInt.zero()));
    this.set("reason", Value.fromString(""));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save VaultTransfer entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save VaultTransfer entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("VaultTransfer", id.toString(), this);
    }
  }

  static load(id: string): VaultTransfer | null {
    return changetype<VaultTransfer | null>(store.get("VaultTransfer", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get token(): Bytes | null {
    let value = this.get("token");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set token(value: Bytes | null) {
    if (!value) {
      this.unset("token");
    } else {
      this.set("token", Value.fromBytes(<Bytes>value));
    }
  }

  get to(): Bytes {
    let value = this.get("to");
    return value!.toBytes();
  }

  set to(value: Bytes) {
    this.set("to", Value.fromBytes(value));
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value!.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }

  get reason(): string {
    let value = this.get("reason");
    return value!.toString();
  }

  set reason(value: string) {
    this.set("reason", Value.fromString(value));
  }
}

export class VaultEthDeposit extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("sender", Value.fromBytes(Bytes.empty()));
    this.set("amount", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save VaultEthDeposit entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save VaultEthDeposit entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("VaultEthDeposit", id.toString(), this);
    }
  }

  static load(id: string): VaultEthDeposit | null {
    return changetype<VaultEthDeposit | null>(store.get("VaultEthDeposit", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get sender(): Bytes {
    let value = this.get("sender");
    return value!.toBytes();
  }

  set sender(value: Bytes) {
    this.set("sender", Value.fromBytes(value));
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value!.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }
}

export class ValutDeposit extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("token", Value.fromBytes(Bytes.empty()));
    this.set("sender", Value.fromBytes(Bytes.empty()));
    this.set("amount", Value.fromBigInt(BigInt.zero()));
    this.set("reason", Value.fromString(""));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save ValutDeposit entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save ValutDeposit entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("ValutDeposit", id.toString(), this);
    }
  }

  static load(id: string): ValutDeposit | null {
    return changetype<ValutDeposit | null>(store.get("ValutDeposit", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get token(): Bytes {
    let value = this.get("token");
    return value!.toBytes();
  }

  set token(value: Bytes) {
    this.set("token", Value.fromBytes(value));
  }

  get sender(): Bytes {
    let value = this.get("sender");
    return value!.toBytes();
  }

  set sender(value: Bytes) {
    this.set("sender", Value.fromBytes(value));
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value!.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }

  get reason(): string {
    let value = this.get("reason");
    return value!.toString();
  }

  set reason(value: string) {
    this.set("reason", Value.fromString(value));
  }
}

export class Voter extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("voter", Value.fromBytes(Bytes.empty()));
    this.set("state", Value.fromString(""));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Voter entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Voter entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Voter", id.toString(), this);
    }
  }

  static load(id: string): Voter | null {
    return changetype<Voter | null>(store.get("Voter", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get voter(): Bytes {
    let value = this.get("voter");
    return value!.toBytes();
  }

  set voter(value: Bytes) {
    this.set("voter", Value.fromBytes(value));
  }

  get state(): string {
    let value = this.get("state");
    return value!.toString();
  }

  set state(value: string) {
    this.set("state", Value.fromString(value));
  }
}

export class Vote extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("voteId", Value.fromBigInt(BigInt.zero()));
    this.set("description", Value.fromString(""));
    this.set("creator", Value.fromBytes(Bytes.empty()));
    this.set("executed", Value.fromBoolean(false));
    this.set("startDate", Value.fromBigInt(BigInt.zero()));
    this.set("snapshotBlock", Value.fromBigInt(BigInt.zero()));
    this.set("supportRequiredPct", Value.fromBigInt(BigInt.zero()));
    this.set("minAcceptQuorumPct", Value.fromBigInt(BigInt.zero()));
    this.set("yea", Value.fromBigInt(BigInt.zero()));
    this.set("nay", Value.fromBigInt(BigInt.zero()));
    this.set("votingPower", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Vote entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Vote entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Vote", id.toString(), this);
    }
  }

  static load(id: string): Vote | null {
    return changetype<Vote | null>(store.get("Vote", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get voteId(): BigInt {
    let value = this.get("voteId");
    return value!.toBigInt();
  }

  set voteId(value: BigInt) {
    this.set("voteId", Value.fromBigInt(value));
  }

  get description(): string {
    let value = this.get("description");
    return value!.toString();
  }

  set description(value: string) {
    this.set("description", Value.fromString(value));
  }

  get creator(): Bytes {
    let value = this.get("creator");
    return value!.toBytes();
  }

  set creator(value: Bytes) {
    this.set("creator", Value.fromBytes(value));
  }

  get executed(): boolean {
    let value = this.get("executed");
    return value!.toBoolean();
  }

  set executed(value: boolean) {
    this.set("executed", Value.fromBoolean(value));
  }

  get startDate(): BigInt {
    let value = this.get("startDate");
    return value!.toBigInt();
  }

  set startDate(value: BigInt) {
    this.set("startDate", Value.fromBigInt(value));
  }

  get snapshotBlock(): BigInt {
    let value = this.get("snapshotBlock");
    return value!.toBigInt();
  }

  set snapshotBlock(value: BigInt) {
    this.set("snapshotBlock", Value.fromBigInt(value));
  }

  get supportRequiredPct(): BigInt {
    let value = this.get("supportRequiredPct");
    return value!.toBigInt();
  }

  set supportRequiredPct(value: BigInt) {
    this.set("supportRequiredPct", Value.fromBigInt(value));
  }

  get minAcceptQuorumPct(): BigInt {
    let value = this.get("minAcceptQuorumPct");
    return value!.toBigInt();
  }

  set minAcceptQuorumPct(value: BigInt) {
    this.set("minAcceptQuorumPct", Value.fromBigInt(value));
  }

  get yea(): BigInt {
    let value = this.get("yea");
    return value!.toBigInt();
  }

  set yea(value: BigInt) {
    this.set("yea", Value.fromBigInt(value));
  }

  get nay(): BigInt {
    let value = this.get("nay");
    return value!.toBigInt();
  }

  set nay(value: BigInt) {
    this.set("nay", Value.fromBigInt(value));
  }

  get votingPower(): BigInt {
    let value = this.get("votingPower");
    return value!.toBigInt();
  }

  set votingPower(value: BigInt) {
    this.set("votingPower", Value.fromBigInt(value));
  }

  get voters(): Array<string> | null {
    let value = this.get("voters");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set voters(value: Array<string> | null) {
    if (!value) {
      this.unset("voters");
    } else {
      this.set("voters", Value.fromStringArray(<Array<string>>value));
    }
  }
}

export class Execution extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("process", Value.fromString(""));
    this.set("proposal", Value.fromString(""));
    this.set("state", Value.fromString(""));
    this.set("executionId", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Execution entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Execution entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Execution", id.toString(), this);
    }
  }

  static load(id: string): Execution | null {
    return changetype<Execution | null>(store.get("Execution", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get process(): string {
    let value = this.get("process");
    return value!.toString();
  }

  set process(value: string) {
    this.set("process", Value.fromString(value));
  }

  get proposal(): string {
    let value = this.get("proposal");
    return value!.toString();
  }

  set proposal(value: string) {
    this.set("proposal", Value.fromString(value));
  }

  get state(): string {
    let value = this.get("state");
    return value!.toString();
  }

  set state(value: string) {
    this.set("state", Value.fromString(value));
  }

  get executionId(): BigInt {
    let value = this.get("executionId");
    return value!.toBigInt();
  }

  set executionId(value: BigInt) {
    this.set("executionId", Value.fromBigInt(value));
  }
}

export class Dao extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("name", Value.fromString(""));
    this.set("dao", Value.fromBytes(Bytes.empty()));
    this.set("creator", Value.fromBytes(Bytes.empty()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Dao entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Dao entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Dao", id.toString(), this);
    }
  }

  static load(id: string): Dao | null {
    return changetype<Dao | null>(store.get("Dao", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get name(): string {
    let value = this.get("name");
    return value!.toString();
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get dao(): Bytes {
    let value = this.get("dao");
    return value!.toBytes();
  }

  set dao(value: Bytes) {
    this.set("dao", Value.fromBytes(value));
  }

  get creator(): Bytes {
    let value = this.get("creator");
    return value!.toBytes();
  }

  set creator(value: Bytes) {
    this.set("creator", Value.fromBytes(value));
  }
}
