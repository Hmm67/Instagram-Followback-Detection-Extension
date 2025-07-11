(async function () {
  if (!location.pathname.match(/^\/[^/]+\/$/)) return; 
  if (document.getElementById("nonf-ui")) return;

  const wait = ms => new Promise(r => setTimeout(r, ms));

  async function clickButton(text) {
    const buttons = [...document.querySelectorAll('a, button')];
    const btn = buttons.find(b => b.textContent.includes(text));
    if (btn) {
      btn.click();
      await wait(1000);
      return true;
    }
    return false;
  }

  async function getUserList() {
    const modal = document.querySelector('div[role="dialog"]');
    if (!modal) return [];

    let scrollContainer = modal.querySelector('div[role="dialog"] > div:nth-child(2)');
    if (!scrollContainer) scrollContainer = modal;

    let lastHeight = 0, stable = 0;
    while (stable < 3) {
      scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
      await wait(1000);
      if (scrollContainer.scrollHeight === lastHeight) {
        stable++;
      } else {
        stable = 0;
        lastHeight = scrollContainer.scrollHeight;
      }
    }

    const links = [...modal.querySelectorAll('a[role="link"]')];
    const users = links.map(link => link.textContent.trim()).filter(Boolean);
    const closeBtn = modal.querySelector('svg[aria-label="Close"]')?.closest('button');
    if (closeBtn) closeBtn.click();
    await wait(1000);
    return users;
  }


  const ui = document.createElement("div");
  ui.id = "nonf-ui";
  ui.style = `
    position: fixed; top: 20px; right: 20px;
    background: white; color: black;
    border: 2px solid black;
    padding: 16px; z-index: 999999;
    font-family: sans-serif;
    max-width: 300px; font-size: 14px;
  `;
  ui.textContent = "Checking followers vs following...";
  document.body.appendChild(ui);

  const success1 = await clickButton("followers");
  if (!success1) return ui.textContent = "Couldn't find followers button.";
  const followers = await getUserList();

  const success2 = await clickButton("following");
  if (!success2) return ui.textContent = "Couldn't find following button.";
  const following = await getUserList();

  const nonFollowers = following.filter(user => !followers.includes(user));

  ui.innerHTML = `
    <b> Not following back (${nonFollowers.length}):</b><br>
    <ul style="max-height: 150px; overflow-y: auto;">
      ${nonFollowers.map(u => `<li>${u}</li>`).join("")}
    </ul>
    <button id="closeUI" style="margin-top:10px;">Close</button>
  `;
  document.getElementById("closeUI").onclick = () => ui.remove();
})();
