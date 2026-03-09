const { LiveChat } = require("youtube-chat");
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// ⚠️ COLOQUE O ID DA SUA LIVE AQUI (Ex: as letras depois do v= no link do YouTube)
const liveId = "COLOQUE_SEU_ID_AQUI"; 
const liveChat = new LiveChat({ liveId });

let jogadores = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

liveChat.on("start", () => {
    console.log("🔥 Conectado à live do YouTube!");
});

liveChat.on("chat", (chatItem) => {
    const msg = chatItem.message[0].text.toLowerCase();
    const autorId = chatItem.author.channelId;
    const nome = chatItem.author.name;
    const foto = chatItem.author.thumbnail.url;

    // Entrar no jogo
    if (msg === "eu" && !jogadores[autorId]) {
        const timeSorteado = Math.random() > 0.5 ? 'azul' : 'vermelho';
        jogadores[autorId] = { id: autorId, nome, foto, time: timeSorteado, premium: false };
        io.emit('atualizarLobby', Object.values(jogadores));
        console.log(`🎮 ${nome} entrou no time ${timeSorteado}!`);
    }

    // Sistema de Poderes
    if (jogadores[autorId]) {
        if (msg === "!gelo") io.emit('usarPoder', { id: autorId, poder: 'gelo' });
        if (msg === "!turbo") io.emit('usarPoder', { id: autorId, poder: 'turbo' });
    }
});

// Sistema VIP (Super Chat / Donate)
liveChat.on("superchat", (chatItem) => {
    const autorId = chatItem.author.channelId;
    const nome = chatItem.author.name;
    const foto = chatItem.author.thumbnail.url;

    if (!jogadores[autorId]) {
        const timeSorteado = Math.random() > 0.5 ? 'azul' : 'vermelho';
        jogadores[autorId] = { id: autorId, nome, foto, time: timeSorteado, premium: true };
    } else {
        jogadores[autorId].premium = true;
    }
    console.log(`💎 SUPER CHAT! ${nome} virou VIP!`);
    io.emit('atualizarLobby', Object.values(jogadores));
});

liveChat.on("error", (err) => console.log("Aguardando mensagens..."));

liveChat.start();
http.listen(3000, () => {
    console.log("🚀 Servidor rodando! Abra http://localhost:3000");
});