# Workout Plugin Template

Use this template as a starting point for creating a new Workout plugin.

## Quick Start

1. Copy this directory and rename it:
   ```
   cp -r plugins/plugin-template plugins/my-plugin
   ```

2. Update `package.json`:
   - Change `name` to `@Workout/plugin-my-plugin`
   - Adjust dependencies (remove `@Workout/analytics` if unused, add `@Workout/csv-parser` if needed)

3. Edit `src/index.ts`:
   - Update the plugin `name` and `description`
   - Implement the sections you need (metrics, charts, achievements, programs, importers)
   - Delete any sections you don't use

4. Register the plugin in the main app by calling `registerPlugin()` from `@Workout/plugin-api`.

## Plugin Capabilities

| Section        | Purpose                                              |
|----------------|------------------------------------------------------|
| `metrics`      | Computed values displayed on the dashboard           |
| `charts`       | Visualizations rendered in the UI                    |
| `achievements` | Goals checked against all lift entries               |
| `programs`     | Set/rep scheme templates users can follow            |
| `importers`    | Parsers for importing data from external file formats|

All sections are optional. See `src/index.ts` for commented examples of each.

## Project Structure

```
my-plugin/
  package.json      # Package config with workspace dependencies
  tsconfig.json     # TypeScript configuration
  src/
    index.ts        # Plugin entry point
```

You can split logic into multiple files under `src/` and re-export from `index.ts`, as the nsuns plugin does.
