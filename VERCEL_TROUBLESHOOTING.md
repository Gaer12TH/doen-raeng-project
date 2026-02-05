# 🔧 Vercel Deployment Troubleshooting

## ปัญหา: "The provided GitHub repository does not contain the requested branch or commit reference"

### สาเหตุที่เป็นไปได้

1. **Vercel ไม่มีสิทธิ์เข้าถึง Repository**
2. **Branch name ไม่ตรงกับที่ Vercel คาดหวัง**
3. **GitHub connection ต้อง refresh**
4. **Repository เป็น Private แต่ไม่ได้ให้สิทธิ์**

---

## วิธีแก้ไข

### วิธีที่ 1: ตรวจสอบ GitHub Permissions

1. ไปที่ **Vercel Dashboard** → **Settings** → **Git**
2. คลิก **"Disconnect"** GitHub account
3. คลิก **"Connect"** อีกครั้งและเลือก **"Install all repositories"** หรือเลือก `Doen-raeng-load-der` เฉพาะ
4. ลองสร้าง project ใหม่อีกครั้ง

### วิธีที่ 2: ใช้ Vercel CLI (แนะนำ)

Deploy ผ่าน Command Line แทนการใช้ Web Interface:

#### ขั้นตอน:

1. **Install Vercel CLI**:
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```powershell
   vercel login
   ```
   (จะเปิดหน้าเว็บให้ยืนยัน)

3. **Deploy Project**:
   ```powershell
   cd "e:\Google antigravity\Doen raeng, load der"
   vercel
   ```

4. **ตอบคำถาม**:
   - Set up and deploy? → **Y**
   - Which scope? → เลือก account ของคุณ
   - Link to existing project? → **N** (สร้างใหม่)
   - Project name? → **doen-raeng-load-der**
   - Directory? → **./frontend** (เพราะโค้ดอยู่ใน frontend folder)
   - Override settings? → **N** (ใช้ค่าจาก vercel.json)

5. **Production Deployment**:
   ```powershell
   vercel --prod
   ```

### วิธีที่ 3: ตรวจสอบ Branch ใน Vercel

บน Vercel Import Page:

1. คลิก **"Edit"** ที่ Root Directory
2. ดูส่วน **"Git Configuration"** หรือ **"Production Branch"**
3. ตรวจสอบว่าเป็น **`main`** (ไม่ใช่ master)
4. ถ้าไม่ใช่ ให้เปลี่ยนเป็น **`main`**

### วิธีที่ 4: สร้าง Repository ใหม่บน GitHub

หากวิธีอื่นไม่ได้ผล:

1. **ปลด connection บน Vercel**:
   - Settings → Git → Disconnect GitHub

2. **Reconnect อีกครั้ง**:
   - ให้สิทธิ์เข้าถึง repository ทั้งหมด

3. **Import ใหม่**:
   - ไปที่ [vercel.com/new](https://vercel.com/new)
   - ค้นหา `Doen-raeng-load-der` อีกครั้ง

### วิธีที่ 5: ตรวจสอบ Repository Visibility

1. ไปที่ GitHub: https://github.com/Gaer12TH/Doen-raeng-load-der
2. Settings → Danger Zone
3. ตรวจสอบว่า Repository เป็น **Public** หรือ **Private**
4. ถ้าเป็น Private ต้องให้สิทธิ์ Vercel App บน GitHub

---

## การทดสอบ Git Repository

ตรวจสอบว่า repository มี commits และ branches ครบถ้วน:

```powershell
# ตรวจสอบ branches
git branch -a

# ตรวจสอบ commits ล่าสุด
git log --oneline -5

# ตรวจสอบ remote branches บน GitHub
git ls-remote --heads origin

# Force push (ถ้าจำเป็น)
git push -f origin main
```

---

## คำแนะนำ

> **แนะนำให้ใช้ Vercel CLI (วิธีที่ 2)** เพราะมันจะช่วย bypass ปัญหา Git integration และ deploy ได้ตรงไปตรงมา

ถ้ายังมีปัญหา ลองเช็คที่:
- [Vercel Status Page](https://vercel-status.com) - ดูว่า Vercel มีปัญหาหรือไม่
- [Vercel Discord](https://vercel.com/discord) - ถามคำถามกับ community
