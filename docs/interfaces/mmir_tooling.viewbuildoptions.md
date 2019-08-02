> **[mmir-webpack 5.0.0](../README.md)**

[Globals](../README.md) / [mmir-tooling](../modules/mmir_tooling.md) / [ViewBuildOptions](mmir_tooling.viewbuildoptions.md) /

# Interface: ViewBuildOptions

## Hierarchy

* [ViewOptions](mmir_tooling.viewoptions.md)

* [BuildOptions](mmir_tooling.buildoptions.md)

  * **ViewBuildOptions**

## Index

### Properties

* [force](mmir_tooling.viewbuildoptions.md#optional-force)
* [path](mmir_tooling.viewbuildoptions.md#optional-path)
* [targetDir](mmir_tooling.viewbuildoptions.md#optional-targetdir)

## Properties

### `Optional` force

• **force**? : *boolean*

*Inherited from [BuildOptions](mmir_tooling.buildoptions.md).[force](mmir_tooling.buildoptions.md#optional-force)*

if TRUE the grammar(s) will be newly created and written to the targetDir,
even if the up-to-date check returns `true`

___

### `Optional` path

• **path**? : *string*

*Inherited from [ViewOptions](mmir_tooling.viewoptions.md).[path](mmir_tooling.viewoptions.md#optional-path)*

file path for searching view files:
```bash
path/views/<controller ID>/*.ehtml
path/layouts/<controller ID>.ehtml
```

___

### `Optional` targetDir

• **targetDir**? : *string*

*Inherited from [BuildOptions](mmir_tooling.buildoptions.md).[targetDir](mmir_tooling.buildoptions.md#optional-targetdir)*

directory to which the compiled resources like grammars (and checksum files) will be stored

by default, the relative paths are resolved against the app's root directory;
if the target directory is missing it will be newly created.

**`default`** [BuildAppConfig.targetDir](mmir_tooling.buildappconfig.md#optional-targetdir) + [ResourceType](../modules/mmir_tooling.md#resourcetype)