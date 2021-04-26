const ws = new WebSocket('ws://localhost:8080');
// otevreni spojeni
ws.addEventListener("open", () => { //jakmile se otevre
    const users = {};
    const createUser = username => {
        let p = document.createElement('p');
        p.appendChild(document.createTextNode(username));
        p.style.position = "absolute";
        document.getElementsByTagName('body')[0].appendChild(p);
        users[username] = p;
    };

    const moveCursor = (u, x, y) => {
        users[u].style.left = x;
        users[u].style.top = y;
    };
    window.addEventListener('mousemove', m => {
        ws.send(JSON.stringify({ x: m.pageX, y: m.pageY }))
    });
    ws.addEventListener("message", raw => {
        const m = JSON.parse(raw.data);
        if (!users[m?.from]) createUser(m?.user); //? = kdyz tam from neni, vrati undefined
        moveCursor(m?.from, m?.x, m?.y);

    })
});