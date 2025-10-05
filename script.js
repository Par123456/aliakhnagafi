// فایل مرکزی JS: مدیریت داده‌های محلی (localStorage) + پنل ادمین موک
(function(){
  const STORAGE_KEY = 'aliakhnagafi_data_v1';
  // ساختار اولیه داده‌ها
  function defaultData(){
    return {
      news: [
        {id:1,title:'شروع سال تحصیلی جدید',content:'کلاس‌ها از تاریخ 1 مهر آغاز می‌شود.' ,date: new Date().toLocaleDateString()},
      ],
      events: [
        {id:1,title:'جلسه‌ی اول انجمن',date:'2025-10-08',desc:'جلسه‌ی انجمن والدین و معلمان'}
      ],
      absentees: [
        {id:1,name:'علی رضایی',class:'دهم-الف',date:new Date().toLocaleDateString(),reason:'تب'}
      ],
      adminPassword: 'admin123' // هش نشده — فقط برای اجرای محلی روی صفحات استاتیک
    };
  }

  function readData(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return defaultData();
      return JSON.parse(raw);
    }catch(e){ return defaultData(); }
  }
  function writeData(d){ localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

  // توابع رندر برای هر صفحه
  function renderNews(){
    const container = document.getElementById('news-list');
    if(!container) return;
    const d = readData();
    container.innerHTML = '';
    d.news.slice().reverse().forEach(n=>{
      const el = document.createElement('div'); el.className='list-item';
      el.innerHTML = `<strong>${escapeHtml(n.title)}</strong> <span class="small">${n.date}</span><div class="small">${escapeHtml(n.content)}</div>`;
      container.appendChild(el);
    });
    if(d.news.length===0) container.innerHTML='<div class="small">هنوز خبری ثبت نشده.</div>';
  }

  function renderEvents(){
    const container = document.getElementById('events-list');
    if(!container) return;
    const d = readData();
    container.innerHTML='';
    d.events.slice().reverse().forEach(ev=>{
      const el = document.createElement('div'); el.className='list-item';
      el.innerHTML = `<strong>${escapeHtml(ev.title)}</strong> <span class="badge">${ev.date}</span><div class="small">${escapeHtml(ev.desc||'')}</div>`;
      container.appendChild(el);
    });
    if(d.events.length===0) container.innerHTML='<div class="small">هنوز رویدادی ثبت نشده.</div>';
  }

  function renderAbsentees(){
    const container = document.getElementById('absentees-list');
    if(!container) return;
    const d = readData();
    container.innerHTML='';
    d.absentees.slice().reverse().forEach(a=>{
      const el = document.createElement('div'); el.className='list-item';
      el.innerHTML = `<strong>${escapeHtml(a.name)}</strong> <span class="small">${escapeHtml(a.class||'')}</span> <div class="small">${a.date} — ${escapeHtml(a.reason||'')}</div>`;
      container.appendChild(el);
    });
    if(d.absentees.length===0) container.innerHTML='<div class="small">لیست غایبین خالی است.</div>';
  }

  // تابع امنِ ساده برای جلوگیری از XSS از ورودی‌های ذخیره‌شده
  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; }); }

  // نمایش پنل ادمین (modal ساده)
  function createAdminPanel(){
    if(document.getElementById('admin-modal')) return;
    const modal = document.createElement('div'); modal.id='admin-modal';
    modal.innerHTML = `
      <div class="card" style="position:fixed;inset:60px 12px 60px 12px;z-index:9999;overflow:auto">
        <h2>پنل ادمین (کلاینت-ساید)</h2>
        <div id="admin-auth" class="form-row">
          <input type="password" id="admin-pass" placeholder="رمز عبور ادمین (پیش‌فرض: admin123)" />
          <button class="btn" id="admin-login">ورود</button>
          <button class="btn" id="admin-close">بستن</button>
        </div>

        <div id="admin-area" style="display:none">
          <h3>افزودن خبر</h3>
          <div class="form-row">
            <input id="news-title" type="text" placeholder="عنوان خبر" />
            <input id="news-date" type="date" />
          </div>
          <div class="form-row"><textarea id="news-content" placeholder="متن خبر" rows="4"></textarea></div>
          <div class="form-row"><button id="news-add" class="btn">افزودن خبر</button></div>

          <h3>افزودن رویداد</h3>
          <div class="form-row">
            <input id="event-title" type="text" placeholder="عنوان رویداد" />
            <input id="event-date" type="date" />
          </div>
          <div class="form-row"><textarea id="event-desc" placeholder="توضیحات (اختیاری)" rows="3"></textarea></div>
          <div class="form-row"><button id="event-add" class="btn">افزودن رویداد</button></div>

          <h3>ثبت غایب</h3>
          <div class="form-row">
            <input id="abs-name" type="text" placeholder="نام و نام خانوادگی" />
            <input id="abs-class" type="text" placeholder="پایه-کلاس (مثال: دهم-الف)" />
            <input id="abs-date" type="date" />
          </div>
          <div class="form-row"><input id="abs-reason" type="text" placeholder="علت (اختیاری)" /></div>
          <div class="form-row"><button id="abs-add" class="btn">ثبت غایب</button></div>

          <h3>تنظیمات</h3>
          <div class="form-row">
            <input id="new-admin-pass" type="text" placeholder="تغییر رمز ادمین (client-side فقط)" />
            <button id="save-pass" class="btn">ذخیره</button>
            <button id="reset-data" class="btn">بازنشانی داده‌ها (پاک کردن همه)</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // دکمه بستن
    document.getElementById('admin-close').addEventListener('click', ()=>{ modal.remove(); });

    // ورود به پنل
    document.getElementById('admin-login').addEventListener('click', ()=>{
      const pass = document.getElementById('admin-pass').value;
      const d = readData();
      if(pass === d.adminPassword){
        document.getElementById('admin-auth').style.display='none';
        document.getElementById('admin-area').style.display='block';
      }else{
        alert('رمز اشتباه است (پیش‌فرض: admin123)');
      }
    });

    // افزودن خبر
    document.getElementById('news-add').addEventListener('click', ()=>{
      const t = document.getElementById('news-title').value.trim();
      const date = document.getElementById('news-date').value || new Date().toLocaleDateString();
      const content = document.getElementById('news-content').value.trim();
      if(!t){ alert('عنوان وارد کنید'); return; }
      const d = readData();
      d.news.push({id: Date.now(), title:t, content:content, date:date});
      writeData(d); renderNews();
      alert('خبر افزوده شد');
    });

    // افزودن رویداد
    document.getElementById('event-add').addEventListener('click', ()=>{
      const t = document.getElementById('event-title').value.trim();
      const date = document.getElementById('event-date').value;
      const desc = document.getElementById('event-desc').value.trim();
      if(!t || !date){ alert('عنوان و تاریخ لازم است'); return; }
      const d = readData();
      d.events.push({id: Date.now(), title:t, date:date, desc:desc});
      writeData(d); renderEvents();
      alert('رویداد افزوده شد');
    });

    // ثبت غایب
    document.getElementById('abs-add').addEventListener('click', ()=>{
      const name = document.getElementById('abs-name').value.trim();
      const cls = document.getElementById('abs-class').value.trim();
      const date = document.getElementById('abs-date').value || new Date().toLocaleDateString();
      const reason = document.getElementById('abs-reason').value.trim();
      if(!name){ alert('نام وارد کنید'); return; }
      const d = readData();
      d.absentees.push({id: Date.now(), name:name, class:cls, date:date, reason:reason});
      writeData(d); renderAbsentees();
      alert('غایب ثبت شد');
    });

    // تغییر رمز ادمین
    document.getElementById('save-pass').addEventListener('click', ()=>{
      const p = document.getElementById('new-admin-pass').value.trim();
      if(!p){ alert('رمز خالی است'); return; }
      const d = readData(); d.adminPassword = p; writeData(d); alert('رمز تغییر کرد (فقط client-side)');
    });

    // بازنشانی داده‌ها
    document.getElementById('reset-data').addEventListener('click', ()=>{
      if(!confirm('آیا مطمئنید؟ همه داده‌ها پاک می‌شود.')) return;
      const d = defaultData(); writeData(d); renderAll(); alert('دیتا بازنشانی شد');
    });
  }

  // رندر کلی
  function renderAll(){ renderNews(); renderEvents(); renderAbsentees(); }

  // تابعی که از index.html فراخوانی می‌شود تا پنل را باز کند
  window.openAdminPanel = function(){ createAdminPanel(); };

  // اجرای اولیه
  document.addEventListener('DOMContentLoaded', ()=>{
    renderAll();
  });

  // expose برای اجرا در سایر صفحات که با GitHub Pages لود می‌شوند
  window.aliakhnagafi_renderAll = renderAll;

})();
