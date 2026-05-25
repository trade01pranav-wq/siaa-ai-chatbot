import { useState, useEffect } from "react";

function App() {

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  // MEMORY AI
  const [memory, setMemory] = useState({
    budget: "",
    category: "",
    brand: "",
  });



  // LOAD CHATS
  useEffect(() => {

    const saved =
      localStorage.getItem("siaa_chats");

    if (saved) {

      setChat(JSON.parse(saved));

    }



    const savedMemory =
      localStorage.getItem("siaa_memory");

    if (savedMemory) {

      setMemory(JSON.parse(savedMemory));

    }

  }, []);




  // SAVE CHATS
  useEffect(() => {

    localStorage.setItem(
      "siaa_chats",
      JSON.stringify(chat)
    );

  }, [chat]);



  // SAVE MEMORY
  useEffect(() => {

    localStorage.setItem(
      "siaa_memory",
      JSON.stringify(memory)
    );

  }, [memory]);



  // VOICE INPUT
  const startListening = () => {

    const recognition =
      new window.webkitSpeechRecognition();

    setListening(true);

    recognition.lang = "en-US";

    recognition.onresult = (event) => {

      setMessage(
        event.results[0][0].transcript
      );

    };

    recognition.onend = () => {

      setListening(false);

    };

    recognition.start();

  };



  // FAQ
  const faqs = {

    refund:
      "Refunds available within 7 days.",

    shipping:
      "Shipping takes 3-5 days.",

    payment:
      "UPI, COD, Credit/Debit Cards supported.",

    contact:
      "support@siaa.ai",

  };



  // TRACKING
  const orders = {

    "123": {
      status: "🚚 Shipped",
      location: "Bangalore Hub",
      delivery: "Tomorrow",
    },

    "456": {
      status: "📦 Packed",
      location: "Mumbai Warehouse",
      delivery: "2 Days",
    },

  };



  const sendMessage = async () => {

    if (!message.trim()) return;



    const userMsg = {

      sender: "user",

      text: message,

    };



    setChat((prev) => [...prev, userMsg]);



    const currentMessage = message;

    setMessage("");

    setLoading(true);



    try {

      const lower =
        currentMessage.toLowerCase();



      // MEMORY UPDATE
      let updatedMemory = {
        ...memory,
      };



      // BUDGET
      const budgetMatch =
        currentMessage.match(/\d+/);

      if (budgetMatch) {

        updatedMemory.budget =
          budgetMatch[0];

      }



      // CATEGORY
      if (lower.includes("laptop")) {
        updatedMemory.category =
          "Laptop";
      }

      if (lower.includes("phone")) {
        updatedMemory.category =
          "Phone";
      }

      if (lower.includes("headphones")) {
        updatedMemory.category =
          "Headphones";
      }

      if (lower.includes("watch")) {
        updatedMemory.category =
          "Watch";
      }



      // BRAND
      if (lower.includes("apple")) {
        updatedMemory.brand =
          "Apple";
      }

      if (lower.includes("samsung")) {
        updatedMemory.brand =
          "Samsung";
      }

      if (lower.includes("asus")) {
        updatedMemory.brand =
          "Asus";
      }

      if (lower.includes("sony")) {
        updatedMemory.brand =
          "Sony";
      }



      setMemory(updatedMemory);




      // FAQ
      let faqReply = null;

      if (lower.includes("refund")) {
        faqReply = faqs.refund;
      }

      if (lower.includes("shipping")) {
        faqReply = faqs.shipping;
      }

      if (lower.includes("payment")) {
        faqReply = faqs.payment;
      }

      if (lower.includes("contact")) {
        faqReply = faqs.contact;
      }




      // ORDER TRACKING
      let trackingData = null;

      if (lower.includes("123")) {
        trackingData = orders["123"];
      }

      if (lower.includes("456")) {
        trackingData = orders["456"];
      }




      // PRODUCT VARIABLES
      let amazonLink = null;
      let flipkartLink = null;

      let productName = null;
      let productPrice = null;
      let productRating = null;
      let productImage = null;




      // SHOPPING DETECTION
      const shoppingWords = [

        "iphone",
        "phone",
        "mobile",
        "laptop",
        "macbook",
        "computer",
        "gaming",
        "watch",
        "smartwatch",
        "headphones",
        "airpods",
        "earbuds",
        "camera",
        "tv",
        "keyboard",
        "mouse",
        "shoes",
        "bag",
        "dress",
        "shirt",
        "buy",
        "price",
        "best",

      ];



      const isShopping =
        shoppingWords.some((word) =>
          lower.includes(word)
        );




      // REAL PRODUCT API
      if (isShopping) {

        let searchQuery =
          currentMessage;



        // USE MEMORY IF USER SAYS GENERAL THINGS
        if (
          lower.includes("suggest") ||
          lower.includes("recommend")
        ) {

          searchQuery =
            `${updatedMemory.brand} ${updatedMemory.category}`;

        }



        const responseProducts =
          await fetch(
            `https://dummyjson.com/products/search?q=${searchQuery}`
          );



        const productData =
          await responseProducts.json();



        if (
          productData.products &&
          productData.products.length > 0
        ) {

          const product =
            productData.products[0];



          productName =
            product.title;

          productPrice =
            `₹${Math.floor(product.price * 85)}`;

          productRating =
            `${product.rating} ⭐`;

          productImage =
            product.thumbnail;



          amazonLink =
            `https://www.amazon.in/s?k=${encodeURIComponent(product.title)}`;

          flipkartLink =
            `https://www.flipkart.com/search?q=${encodeURIComponent(product.title)}`;

        }

      }




      // AI BACKEND
      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: currentMessage,
          }),

        }
      );



      const data =
        await response.json();




      const botMsg = {

        sender: "bot",

        text:
          faqReply ||
          `${data.reply}

🧠 Memory:
Budget: ${updatedMemory.budget || "Not set"}
Category: ${updatedMemory.category || "Not set"}
Brand: ${updatedMemory.brand || "Not set"}`,



        trackingData,

        amazonLink,

        flipkartLink,

        productName,

        productPrice,

        productRating,

        productImage,

      };



      setChat((prev) => [...prev, botMsg]);

    } catch (error) {

      console.log(error);



      setChat((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Something went wrong.",
        },
      ]);

    }



    setLoading(false);

  };



  // CLEAR
  const clearChats = () => {

    localStorage.removeItem("siaa_chats");

    localStorage.removeItem("siaa_memory");

    setChat([]);

    setMemory({
      budget: "",
      category: "",
      brand: "",
    });

  };



  return (

    <div className="h-screen bg-black overflow-hidden relative">

      {/* BACKGROUND */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl top-[-200px] left-[-200px]" />

      <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl bottom-[-200px] right-[-200px]" />



      {/* FLOAT BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-cyan-500 text-white text-2xl z-50 shadow-lg hover:scale-110 transition"
      >
        ✦
      </button>



      {/* CHAT */}
      {open && (

        <div className="fixed bottom-8 right-6 w-[380px] h-[700px] bg-[#111827] rounded-[30px] border border-white/10 flex flex-col overflow-hidden shadow-2xl">

          {/* HEADER */}
          <div className="p-5 border-b border-white/10 flex justify-between">

            <div>

              <h1 className="text-white text-xl font-bold">

                Siaa AI

              </h1>

              <p className="text-cyan-400 text-sm">

                Memory Shopping Assistant

              </p>

            </div>



            <div className="flex gap-3">

              <button
                onClick={clearChats}
                className="text-red-400 text-sm"
              >
                Clear
              </button>



              <button
                onClick={() => setOpen(false)}
                className="text-white"
              >
                ✕
              </button>

            </div>

          </div>



          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {chat.map((msg, index) => (

              <div
                key={index}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`max-w-[90%] px-4 py-4 rounded-3xl text-sm ${
                    msg.sender === "user"
                      ? "bg-cyan-500 text-white"
                      : "bg-white/5 text-white border border-white/10"
                  }`}
                >

                  {/* PRODUCT IMAGE */}
                  {msg.productImage && (

                    <img
                      src={msg.productImage}
                      alt="product"
                      className="w-full h-44 object-cover rounded-2xl mb-4"
                    />

                  )}



                  {/* PRODUCT CARD */}
                  {msg.productName && (

                    <div className="mb-4 bg-black/30 border border-white/10 rounded-2xl p-4">

                      <h2 className="text-lg font-bold text-white">

                        {msg.productName}

                      </h2>



                      <p className="text-cyan-400 mt-2">

                        {msg.productPrice}

                      </p>



                      <p className="text-yellow-400">

                        {msg.productRating}

                      </p>

                    </div>

                  )}



                  {/* TEXT */}
                  <p className="whitespace-pre-wrap leading-7">

                    {msg.text}

                  </p>



                  {/* TRACKING */}
                  {msg.trackingData && (

                    <div className="mt-4 bg-black/30 p-4 rounded-2xl">

                      <p>
                        {msg.trackingData.status}
                      </p>

                      <p className="text-cyan-400">
                        📍 {msg.trackingData.location}
                      </p>

                      <p>
                        📅 {msg.trackingData.delivery}
                      </p>

                    </div>

                  )}



                  {/* BUTTONS */}
                  {msg.amazonLink && (

                    <div className="mt-4 flex flex-col gap-3">

                      <button
                        onClick={() =>
                          window.open(
                            msg.amazonLink,
                            "_blank"
                          )
                        }
                        className="w-full bg-yellow-500 text-black py-3 rounded-xl font-semibold"
                      >

                        🛒 Amazon

                      </button>



                      <button
                        onClick={() =>
                          window.open(
                            msg.flipkartLink,
                            "_blank"
                          )
                        }
                        className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold"
                      >

                        🛍 Flipkart

                      </button>

                    </div>

                  )}

                </div>

              </div>

            ))}



            {/* LOADING */}
            {loading && (

              <div className="bg-white/5 px-5 py-4 rounded-3xl w-fit">

                <div className="flex gap-2">

                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>

                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>

                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>

                </div>

              </div>

            )}

          </div>



          {/* INPUT */}
          <div className="p-4 border-t border-white/10">

            <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">

              <input
                type="text"
                value={message}
                placeholder="Ask Siaa AI..."
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                className="flex-1 bg-transparent text-white outline-none"
              />



              {/* MIC */}
              <button
                onClick={startListening}
                className={`w-11 h-11 rounded-xl text-white ${
                  listening
                    ? "bg-red-500 animate-pulse"
                    : "bg-white/10"
                }`}
              >

                {listening ? "🎙️" : "🎤"}

              </button>



              {/* SEND */}
              <button
                onClick={sendMessage}
                className="w-11 h-11 rounded-xl bg-cyan-500 text-white"
              >
                ➤
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}

export default App;