# Expo Server Hanging - Troubleshooting Guide

## Common Causes & Solutions

### 1. Node.js Version Compatibility Issue ⚠️
**Problem**: You're using Node.js v22.9.0, which can cause Expo CLI to hang.

**Solutions**:
- **Recommended**: Use Node.js v18 LTS or v20 LTS
- **Quick Fix**: Use `npm run start:clear` to clear cache
- **Alternative**: Use `npm run start:tunnel` for better connectivity

### 2. Corrupted Cache Files
**Problem**: Corrupted `.expo` directory or Metro cache.

**Solutions**:
```bash
# Windows
npm run clean:win

# Mac/Linux
npm run clean
```

### 3. Network/Port Issues
**Problem**: Port 19000 already in use or network connectivity issues.

**Solutions**:
- Kill processes using port 19000: `npx kill-port 19000`
- Use different connection method: `npm run start:lan` or `npm run start:tunnel`

### 4. Terminal Compatibility
**Problem**: Some terminals cause Expo to enter non-interactive mode.

**Solutions**:
- Use VS Code integrated terminal
- Use Windows PowerShell (not Git Bash)
- Use Command Prompt

## Quick Fix Commands

```bash
# 1. Clear all caches and restart
npm run clean:win

# 2. Start with cleared cache
npm run start:clear

# 3. Check for issues
npm run doctor

# 4. Start with tunnel (if LAN doesn't work)
npm run start:tunnel
```

## Prevention Tips

1. **Use Node.js v18 or v20** - Avoid Node.js v22+ for now
2. **Regular cache clearing** - Run `npm run clean:win` weekly
3. **Stable internet connection** - Use LAN mode when possible
4. **Close other development servers** - Avoid port conflicts

## Emergency Recovery

If Expo completely hangs:
1. Press `Ctrl+C` to stop
2. Run `npm run clean:win`
3. Wait 30 seconds
4. Run `npm run start:clear`
5. If still hanging, try `npm run start:tunnel`

