# ✅ CHECKLIST DEPLOYMENT

## 📋 FILES ĐÃ TẠO

- [x] `.gitignore` - Git ignore rules
- [x] `render.yaml` - Render auto-config
- [x] `DEPLOY.md` - Hướng dẫn deploy chi tiết
- [x] `DEPLOYMENT_SUMMARY.md` - Tóm tắt những gì đã làm
- [x] `CHECKLIST.md` - File này

## 🔧 CODE ĐÃ SỬA

- [x] `backend/server.js` - CORS cho https://archive.id.vn
- [x] `frontend/index.html` - API_BASE auto-detect
- [x] `package.json` (root) - Thêm build scripts & engines
- [x] `CODEMAP.md` - Cập nhật deployment info

## 🎯 KHÔNG XÓA GÌ CẢ

- [x] Giữ nguyên `backend/cauhoi.txt`
- [x] Giữ nguyên `tmp.txt`
- [x] Giữ nguyên tất cả files khác

## 🚀 SẴN SÀNG DEPLOY

### Bước 1: Git Setup
```bash
git init
git add .
git commit -m "Ready for deployment to archive.id.vn"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### Bước 2: Render Setup
1. Đăng nhập https://render.com
2. New + → Web Service
3. Connect repository
4. Auto-detect `render.yaml` hoặc điền:
   - Build: `npm run build`
   - Start: `npm start`
   - Environment: `NODE_ENV=production`

### Bước 3: Custom Domain
1. Settings → Custom Domain
2. Add: `archive.id.vn`
3. Copy CNAME record → DNS provider
4. Đợi SSL auto-provision

### Bước 4: Test
- [ ] https://archive.id.vn loads
- [ ] Chat hoạt động
- [ ] Validate code hoạt động
- [ ] Không có CORS error
- [ ] HTTPS có ổ khóa xanh

## 📖 ĐỌC THÊM

- Chi tiết: `DEPLOY.md`
- Tóm tắt: `DEPLOYMENT_SUMMARY.md`
- Code map: `CODEMAP.md`
