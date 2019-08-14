> **[mmir-webpack 5.2.0](../README.md)**

[Globals](../README.md) / [mmir-lib](../modules/mmir_lib.md) / [MmirCore](mmir_lib.mmircore.md) /

# Interface: MmirCore

## Hierarchy

* **MmirCore**

  * [MmirModule](mmir_lib.mmirmodule.md)

## Index

### Properties

* [_define](mmir_lib.mmircore.md#_define)
* [_mmirLibPath](mmir_lib.mmircore.md#_mmirlibpath)
* [config](mmir_lib.mmircore.md#config)
* [debug](mmir_lib.mmircore.md#debug)
* [jquery](mmir_lib.mmircore.md#jquery)
* [libMode](mmir_lib.mmircore.md#libmode)
* [logLevel](mmir_lib.mmircore.md#loglevel)
* [logTrace](mmir_lib.mmircore.md#logtrace)
* [mmirName](mmir_lib.mmircore.md#mmirname)
* [ready](mmir_lib.mmircore.md#ready)
* [require](mmir_lib.mmircore.md#require)
* [startModule](mmir_lib.mmircore.md#startmodule)
* [startModules](mmir_lib.mmircore.md#startmodules)
* [version](mmir_lib.mmircore.md#version)
* [viewEngine](mmir_lib.mmircore.md#viewengine)

### Methods

* [isVersion](mmir_lib.mmircore.md#isversion)

## Properties

###  _define

• **_define**: *null | [RequireJsDefine](mmir_lib.requirejsdefine.md)*

___

###  _mmirLibPath

• **_mmirLibPath**: *string*

___

###  config

• **config**: *function*

#### Type declaration:

▸ (`requirejsConfig`: `__type`): *void*

**Parameters:**

Name | Type |
------ | ------ |
`requirejsConfig` | `__type` |

___

###  debug

• **debug**: *boolean*

___

###  jquery

• **jquery**: *undefined | any*

___

###  libMode

• **libMode**: *undefined | "min"*

___

###  logLevel

• **logLevel**: *[LogLevelNum](../modules/mmir_lib.md#loglevelnum) | [LogLevel](../modules/mmir_lib.md#loglevel)*

___

###  logTrace

• **logTrace**: *boolean | object*

___

###  mmirName

• **mmirName**: *"mmir" | string*

___

###  ready

• **ready**: *function*

#### Type declaration:

▸ (`onFrameworkReady`: function): *any*

**Parameters:**

▪ **onFrameworkReady**: *function*

▸ (...`args`: any[]): *any*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

___

###  require

• **require**: *[RequireJs](mmir_lib.requirejs.md)*

___

###  startModule

• **startModule**: *string*

___

###  startModules

• **startModules**: *undefined | `Array<string>`*

___

###  version

• **version**: *string*

___

###  viewEngine

• **viewEngine**: *string*

## Methods

###  isVersion

▸ **isVersion**(`verion`: string, `comparator`: [Comparator](../modules/mmir_lib.md#comparator)): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`verion` | string |
`comparator` | [Comparator](../modules/mmir_lib.md#comparator) |

**Returns:** *boolean*