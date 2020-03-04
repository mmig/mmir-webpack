[mmir-webpack 6.1.0](../README.md) › [mmir-tooling](../modules/mmir_tooling.md) › [ResourcesOptions](mmir_tooling.resourcesoptions.md)

# Interface: ResourcesOptions

options for handling found resources when parsing the resourcesPath

## Hierarchy

* **ResourcesOptions**

## Index

### Properties

* [addModuleExport](mmir_tooling.resourcesoptions.md#optional-addmoduleexport)
* [exclude](mmir_tooling.resourcesoptions.md#optional-exclude)

## Properties

### `Optional` addModuleExport

• **addModuleExport**? : *boolean*

for automatically converting old-style implementations that are no CommonJS or AMD modules:
if `true`, explicitly exports the implementation resource (i.e. as module.exports)

**`see`** ImplementationEntry

___

### `Optional` exclude

• **exclude**? : *Array‹[ResourceTypeName](../modules/mmir_tooling.md#resourcetypename)›*

excludes the specified resources types when parsing the `resourcesPath`
