> **[mmir-webpack 5.0.0](../README.md)**

[Globals](../README.md) / [mmir-lib](../modules/mmir_lib.md) / [RequireJs](mmir_lib.requirejs.md) /

# Interface: RequireJs

## Hierarchy

* `Function`

  * **RequireJs**

## Index

### Properties

* [Function](mmir_lib.requirejs.md#function)
* [arguments](mmir_lib.requirejs.md#arguments)
* [caller](mmir_lib.requirejs.md#caller)
* [config](mmir_lib.requirejs.md#config)
* [defined](mmir_lib.requirejs.md#defined)
* [isBrowser](mmir_lib.requirejs.md#isbrowser)
* [length](mmir_lib.requirejs.md#length)
* [name](mmir_lib.requirejs.md#name)
* [prototype](mmir_lib.requirejs.md#prototype)
* [specified](mmir_lib.requirejs.md#specified)
* [toUrl](mmir_lib.requirejs.md#tourl)
* [undef](mmir_lib.requirejs.md#undef)

### Methods

* [__@hasInstance](mmir_lib.requirejs.md#__@hasinstance)
* [apply](mmir_lib.requirejs.md#apply)
* [bind](mmir_lib.requirejs.md#bind)
* [call](mmir_lib.requirejs.md#call)
* [toString](mmir_lib.requirejs.md#tostring)

## Properties

###  Function

• **Function**: *`FunctionConstructor`*

___

###  arguments

• **arguments**: *any*

*Inherited from void*

___

###  caller

• **caller**: *`Function`*

*Inherited from void*

___

###  config

• **config**: *function*

#### Type declaration:

▸ (`configuration`: any): *void*

**Parameters:**

Name | Type |
------ | ------ |
`configuration` | any |

___

###  defined

• **defined**: *function*

#### Type declaration:

▸ (`id`: any): *any*

**Parameters:**

Name | Type |
------ | ------ |
`id` | any |

___

###  isBrowser

• **isBrowser**: *boolean*

___

###  length

• **length**: *number*

*Inherited from void*

___

###  name

• **name**: *string*

*Inherited from void*

Returns the name of the function. Function names are read-only and can not be changed.

___

###  prototype

• **prototype**: *any*

*Inherited from void*

___

###  specified

• **specified**: *function*

#### Type declaration:

▸ (`id`: any): *any*

**Parameters:**

Name | Type |
------ | ------ |
`id` | any |

___

###  toUrl

• **toUrl**: *function*

#### Type declaration:

▸ (`moduleNamePlusExt`: any): *any*

**Parameters:**

Name | Type |
------ | ------ |
`moduleNamePlusExt` | any |

___

###  undef

• **undef**: *function*

#### Type declaration:

▸ (`id`: any): *void*

**Parameters:**

Name | Type |
------ | ------ |
`id` | any |

## Methods

###  __@hasInstance

▸ **__@hasInstance**(`value`: any): *boolean*

*Inherited from void*

Determines whether the given value inherits from this function if this function was used
as a constructor function.

A constructor function can control which objects are recognized as its instances by
'instanceof' by overriding this method.

**Parameters:**

Name | Type |
------ | ------ |
`value` | any |

**Returns:** *boolean*

___

###  apply

▸ **apply**(`this`: `Function`, `thisArg`: any, `argArray?`: any): *any*

*Inherited from void*

Calls the function, substituting the specified object for the this value of the function, and the specified array for the arguments of the function.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`this` | `Function` | - |
`thisArg` | any | The object to be used as the this object. |
`argArray?` | any | A set of arguments to be passed to the function.  |

**Returns:** *any*

___

###  bind

▸ **bind**(`this`: `Function`, `thisArg`: any, ...`argArray`: any[]): *any*

*Inherited from void*

For a given function, creates a bound function that has the same body as the original function.
The this object of the bound function is associated with the specified object, and has the specified initial parameters.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`this` | `Function` | - |
`thisArg` | any | An object to which the this keyword can refer inside the new function. |
`...argArray` | any[] | A list of arguments to be passed to the new function.  |

**Returns:** *any*

___

###  call

▸ **call**(`this`: `Function`, `thisArg`: any, ...`argArray`: any[]): *any*

*Inherited from void*

Calls a method of an object, substituting another object for the current object.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`this` | `Function` | - |
`thisArg` | any | The object to be used as the current object. |
`...argArray` | any[] | A list of arguments to be passed to the method.  |

**Returns:** *any*

___

###  toString

▸ **toString**(): *string*

*Inherited from void*

Returns a string representation of a function.

**Returns:** *string*