async function translateMyMemory(text) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|en`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json.responseData.translatedText;
  } catch (error) {
    console.error("Trans error:", error);
    return null;
  }
}

translateMyMemory("Minimalist крем для лица с церамидами 0,3%").then(console.log);
