# Crossref & SciELO Debug Guide

## 🧪 Test Results

### API Status (Direct Tests)
- ✅ **PubMed**: Working perfectly
- ✅ **Crossref**: Working perfectly  
- ❌ **SciELO**: Returning 403 Forbidden (rate limiting or access issue)

### Provider Class Tests
- ✅ **Crossref Provider**: Tested independently and works correctly
- ✅ **Configuration**: All providers registered and enabled correctly

## 🔧 What I Fixed

1. **Cleared Next.js build cache** (`.next` folder)
2. **Verified all provider integrations** are correct
3. **Confirmed Crossref API** is accessible and returning results

## 📋 Steps to Make Crossref Work

### 1. Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 2. Check Console Logs
When you search, look for these logs in your **terminal** (not browser console):

```
🔍 Searching crossref for: milk
✅ crossref returned X results
```

If you see:
- `❌ Error searching crossref:` → Check the error details
- `Provider crossref not found` → The service isn't loading correctly

### 3. Check Browser Console
Open your **browser DevTools** (F12) → Console tab

Look for network errors or failed requests to `/api/referencias/search`

### 4. Test the API Endpoint Directly

Run this test while logged in:
```bash
node test-api-crossref.js
```

You'll need to be authenticated to test the API.

## 🐛 Known Issues

### SciELO 403 Error
SciELO's API is currently returning **403 Forbidden** errors. This could be:
- Rate limiting from too many requests
- IP-based blocking
- API endpoint changes
- Server-side issues

**Workaround**: SciELO has a fallback mechanism but it may not work reliably.

### Crossref & PubMed
Both are working correctly at the API level. If they're not showing results in the app:

1. **Check if dev server restarted** after adding crossref.provider.ts
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Check terminal logs** for errors during search
4. **Verify authentication** - the API requires login

## 🔍 Debugging Commands

### Test all providers:
```bash
node test-all-providers.js
```

### Test Crossref independently:
```bash
node test-providers-app.mjs
```

### Check service configuration:
```bash
node debug-service.mjs
```

## ✅ Expected Behavior

When you search with:
- **"All Sources"**: Should search SciELO (may fail), PubMed, and Crossref
- **"SciELO"**: May return 403 error or fallback results
- **"PubMed"**: Should work correctly
- **"Crossref"**: Should return results from Crossref API

## 📊 What to Check in Browser

1. **Network Tab** (F12 → Network):
   - Check the POST request to `/api/referencias/search`
   - Look at the request body (should have `source: "crossref"`)
   - Check the response (should have `articles` array)

2. **Console Tab**:
   - Look for any JavaScript errors
   - Check for failed imports

3. **Application Tab** → Local Storage:
   - Clear any cached searches if needed

## 🎯 Next Steps

1. **Restart dev server** with `npm run dev`
2. **Search for "milk"** with source **"Crossref"**
3. **Check terminal output** for logs
4. **Check browser console** for errors
5. **Report back** what logs you see

If Crossref still doesn't work after restart, share:
- Terminal output when searching
- Browser console errors
- Network tab response from `/api/referencias/search`
