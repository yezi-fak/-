// ----------------- 时间显示 -----------------
function updateTime() {
    const timeEl = document.getElementById('time');
    const now = new Date();
    const h = now.getHours().toString().padStart(2,'0');
    const m = now.getMinutes().toString().padStart(2,'0');
    const s = now.getSeconds().toString().padStart(2,'0');
    timeEl.textContent = `${h}:${m}:${s}`;
}
setInterval(updateTime, 1000);
updateTime();

// ----------------- 搜索功能 -----------------
document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    if(query) window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
});

// ----------------- 快捷栏 -----------------
function makeShortcut(element) {
    element.addEventListener('click', () => {
        const url = element.dataset.url;
        if(url) window.open(url, '_blank');
        else if(element.classList.contains('add-shortcut')){
            const name = prompt("名称:");
            const url = prompt("网址:");
            if(name && url){
                const newShortcut = document.createElement('div');
                newShortcut.className = 'shortcut';
                newShortcut.textContent = name;
                newShortcut.dataset.url = url;
                document.getElementById('shortcutBar').insertBefore(newShortcut, element);
                makeShortcut(newShortcut);
            }
        }
    });
}

document.querySelectorAll('.shortcut').forEach(makeShortcut);

// ----------------- 可拖动快捷栏 -----------------
let dragged;
document.addEventListener('dragstart', e => {
    if(e.target.classList.contains('shortcut')){
        dragged = e.target;
        e.dataTransfer.effectAllowed = 'move';
    }
});
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => {
    if(e.target.classList.contains('shortcut') && dragged){
        const bar = document.getElementById('shortcutBar');
        bar.insertBefore(dragged, e.target.nextSibling);
    }
});

// ----------------- 夜间模式 -----------------
const nightModeCheckbox = document.getElementById('nightMode');
nightModeCheckbox.addEventListener('change', () => {
    document.body.classList.toggle('night', nightModeCheckbox.checked);
    changeWallpaper();
});

// ----------------- 壁纸切换 & 渐变色叠加 -----------------
async function changeWallpaper() {
    const overlay = document.querySelector('.overlay');
    try{
        // 国内稳定随机壁纸
        const url = `https://picsum.photos/1920/1080?random=${Date.now()}`;

        const tempImg = new Image();
        tempImg.src = url;
        tempImg.onload = () => {
            overlay.style.opacity = 0;
            setTimeout(()=> {
                overlay.style.backgroundImage = `url(${url})`;
                overlay.style.opacity = 1;
                applyToneGradient();
            }, 500);
        };
    }catch(e){
        console.log("壁纸加载失败", e);
    }
}

// 动态渐变色叠加（根据时间/夜间模式）
function applyToneGradient(){
    const overlay = document.querySelector('.overlay');
    const hour = new Date().getHours();
    let gradient = '';
    if(hour >= 6 && hour < 12) gradient = 'linear-gradient(rgba(255,200,150,0.2), rgba(255,230,200,0.2))'; // 早晨
    else if(hour >= 12 && hour < 18) gradient = 'linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0.1))'; // 中午
    else if(hour >= 18 && hour < 20) gradient = 'linear-gradient(rgba(255,140,100,0.2), rgba(255,200,150,0.2))'; // 黄昏
    else gradient = 'linear-gradient(rgba(0,0,50,0.3), rgba(0,0,30,0.3))'; // 晚上

    if(nightModeCheckbox.checked) gradient = 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5))';
    overlay.style.backgroundImage = `${gradient}, ${overlay.style.backgroundImage.split(', ')[1]}`;
}

changeWallpaper();
setInterval(changeWallpaper, 60000);

// ----------------- 天气显示（国内IP定位） -----------------
async function updateWeather() {
    const weatherEl = document.getElementById('weather-info');
    const iconEl = document.getElementById('weather-icon');
    try{
        // 国内稳定定位
        const locationRes = await fetch('http://ip-api.com/json/?lang=zh-CN');
        const locationData = await locationRes.json();
        const city = locationData.city || 'Beijing';

        const res = await fetch(`https://wttr.in/${city}?format=j1`);
        const data = await res.json();
        const temp = data.current_condition[0].temp_C;
        const weatherDesc = data.current_condition[0].weatherDesc[0].value;
        weatherEl.textContent = `${city}: ${weatherDesc} ${temp}°C`;

        if(weatherDesc.includes("Rain")) iconEl.textContent = "🌧️";
        else if(weatherDesc.includes("Cloud")) iconEl.textContent = "☁️";
        else if(weatherDesc.includes("Sunny")) iconEl.textContent = "☀️";
        else iconEl.textContent = "🌡️";

        applyToneGradient();
    }catch(e){
        weatherEl.textContent = "天气加载失败";
    }
}

updateWeather();
setInterval(updateWeather, 10*60*1000);
