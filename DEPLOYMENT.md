# 🚀 คู่มือการ Deploy ไปยัง Vercel

## สถาปัตยกรรมของระบบ

- **Frontend**: React + Vite → Deploy บน Vercel
- **Backend**: Node.js + Express → Deploy บน Render (https://doen-raeng-project.onrender.com)

## ขั้นตอนการ Deploy Frontend ไปยัง Vercel

### 1. เตรียม Git Repository

ตรวจสอบว่า code ของคุณอยู่บน GitHub, GitLab หรือ Bitbucket แล้ว

```bash
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

### 2. Import Project ไปยัง Vercel

1. เข้า [https://vercel.com](https://vercel.com)
2. คลิก **"Add New Project"**
3. เลือก Git repository ของคุณ
4. เลือกโปรเจกต์ **"doen-raeng-project"** (หรือชื่อ repo ของคุณ)

### 3. Configure Project

Vercel จะตรวจจับการตั้งค่าอัตโนมัติจาก `vercel.json` แต่ให้ตรวจสอบ:

- **Framework Preset**: Vite
- **Root Directory**: `./` (ไม่ต้องเปลี่ยน)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `cd frontend && npm install`

### 4. ตั้งค่า Environment Variables

ใน Vercel Dashboard → Settings → Environment Variables เพิ่ม:

| Variable Name | Value |
|--------------|-------|
| `VITE_API_URL` | `https://doen-raeng-project.onrender.com/api` |

> **หมายเหตุ**: หากต้องการให้ frontend เรียก API ผ่าน Vercel proxy (recommended) ไม่ต้องตั้งค่า environment variable นี้ เพราะจะใช้ `/api` path ที่ Vercel จะ rewrite ไปยัง Render โดยอัตโนมัติ

### 5. Deploy

1. คลิก **"Deploy"**
2. รอจนกว่า deployment จะเสร็จสมบูรณ์ (ประมาณ 1-2 นาที)
3. Vercel จะให้ URL เช่น `https://your-project.vercel.app`

### 6. ทดสอบการทำงาน

เข้าไปที่ URL ที่ Vercel ให้มา และทดสอบ:

- [ ] หน้าเว็บโหลดได้ปกติ
- [ ] กรอก YouTube URL และกด fetch info
- [ ] ตรวจสอบว่า video info แสดงผลถูกต้อง
- [ ] ทดสอบดาวน์โหลดวิดีโอ
- [ ] ตรวจสอบ responsive design บนมือถือ

## การอัพเดทโปรเจกต์

เมื่อมีการเปลี่ยนแปลง code:

```bash
git add .
git commit -m "อธิบายการเปลี่ยนแปลง"
git push origin main
```

Vercel จะ deploy ใหม่อัตโนมัติเมื่อ push ไปยัง main branch

## การจัดการ Backend บน Render

Backend ยังคงอยู่บน Render ดังนั้น:

1. **อัพเดท CORS**: ให้แน่ใจว่า backend อนุญาต origin จาก Vercel
2. **Monitor Logs**: เข้าไปดู logs บน Render dashboard หากมีปัญหา
3. **Keep Alive**: Render free tier จะ sleep หากไม่มีการใช้งาน 15 นาที

## Troubleshooting

### ❌ API calls ไม่ทำงาน

**วิธีแก้**:
1. เช็ค Network tab ใน DevTools ว่า API endpoint ถูกต้องหรือไม่
2. ตรวจสอบว่า backend บน Render กำลังทำงานอยู่
3. เช็ค CORS settings ใน backend

### ❌ Build Failed

**วิธีแก้**:
1. ตรวจสอบ build logs บน Vercel
2. ทดสอบ build locally: `cd frontend && npm run build`
3. ตรวจสอบว่า dependencies ใน `package.json` ครบถ้วน

### ❌ Environment Variables ไม่ทำงาน

**วิธีแก้**:
1. ตรวจสอบว่าชื่อ variable ขึ้นต้นด้วย `VITE_`
2. Redeploy หลังจากเพิ่ม environment variables
3. ตรวจสอบว่าใช้ `import.meta.env.VITE_API_URL` ใน code

## Custom Domain (Optional)

หากต้องการใช้ domain ของตัวเอง:

1. ไปที่ Vercel Dashboard → Settings → Domains
2. เพิ่ม custom domain
3. Update DNS records ตามที่ Vercel แนะนำ
4. รอ DNS propagation (5-30 นาที)

## ข้อมูลเพิ่มเติม

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel CLI](https://vercel.com/docs/cli) สำหรับ deploy ผ่าน command line
