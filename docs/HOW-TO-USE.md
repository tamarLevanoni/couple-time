# How to Use the Project Documentation System

## Overview
The project documentation is organized in the docs folder to prevent overload and improve navigation.

## File Structure
```
couple-time/
├── README.md                    # Quick start and overview
├── CLAUDE.md                    # Development standards (unchanged)
├── projectplan.md              # Simplified, current phase only
└── docs/
    ├── HOW-TO-USE.md           # This file
    ├── project/
    │   ├── PROJECT-OVERVIEW.md  # Main project status
    │   └── CURRENT-TASKS.md     # Active work
    ├── phases/                  # Completed phase documentation
    │   ├── phase-1-apis.md      # Phase 1 completion details
    │   ├── phase-2-types.md     # Phase 2 completion details
    │   └── ...
    └── api/                     # API specifications and docs
        ├── endpoints.md         # Complete API endpoint specs
        └── ...
```

## Usage Guidelines

### Before Starting Work
1. **Read** `docs/project/PROJECT-OVERVIEW.md` for current project status
2. **Check** `docs/project/CURRENT-TASKS.md` for active work
3. **Follow** `CLAUDE.md` workflow (plan → approve → implement → test)

### During Development
1. **Update** `docs/project/CURRENT-TASKS.md` as you complete items
2. **Reference** `docs/phases/` for completed work context
3. **Keep** `docs/project/PROJECT-OVERVIEW.md` updated with major progress

### After Completing Work
1. **Archive** completed phases in `docs/phases/`
2. **Update** `docs/project/PROJECT-OVERVIEW.md` with new status
3. **Clean** `docs/project/CURRENT-TASKS.md` for next phase

## File Size Limits
- **Main files**: Keep under 200 lines each
- **Current tasks**: Focus on immediate work only
- **Archive files**: No limit, but organize by phase

## Navigation Tips
- **Start here**: Always begin with `docs/project/PROJECT-OVERVIEW.md`
- **Active work**: Use `docs/project/CURRENT-TASKS.md` for daily development
- **Reference**: Use `docs/phases/` for completed work details
- **Standards**: Use `CLAUDE.md` for development rules

## Benefits
- **Organized structure**: All docs in docs folder
- **Reduced cognitive load**: Smaller, focused files
- **Better navigation**: Clear file structure and purpose
- **Easier maintenance**: Archive completed work
- **Improved focus**: Current tasks file for active work

---

*This system prevents information overload while maintaining complete project documentation.*