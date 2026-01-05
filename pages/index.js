export default function Home() {
  async function gerar() {
    const prompt = document.getElementById("prompt").value;
    const status = document.getElementById("status");
    const img = document.getElementById("img");

    if (!prompt || prompt.length < 3) {
      alert("Digite um prompt decente");
      return;
    }

    status.innerText = "Gerando imagem...";
    img.src = "";

    const res = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    if (!data.success) {
      status.innerText = "Erro ao gerar imagem";
      return;
    }

    img.src = data.image;
    status.innerText = "Imagem pronta";
  }

  return (
    <div style={{ padding: 20, background: "#0f0f0f", minHeight: "100vh", color: "#fff" }}>
      <h1>Gerador Subnp</h1>
      <textarea id="prompt" style={{ width: "100%", height: 120 }} />
      <br />
      <button onClick={gerar} style={{ marginTop: 10 }}>Gerar</button>
      <p id="status"></p>
      <img id="img" style={{ maxWidth: "100%", marginTop: 20 }} />
    </div>
  );
}
