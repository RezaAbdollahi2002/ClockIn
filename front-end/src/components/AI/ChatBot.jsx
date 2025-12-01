import React, { useState } from 'react';
import chatBotImage from "../../images/Bot.png";
import { IoIosSend } from "react-icons/io";
import { AiOutlineLoading } from "react-icons/ai";

import axios from 'axios';

const ChatBot = () => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState("");
    const [showPromt, setShowPrompt] = useState("");

    const sendPrompt = async () => {
        if (!prompt.trim()) return; // don't send empty messages


        try {
            setLoading(true);
            const res = await axios.post("/api/gemini/generate", {
                text: prompt,        // 👈 send JSON body, not params
            });

            console.log(res.data);
            setResponse(res.data.response);
            setShowPrompt(prompt); // 👈 show model response
            setPrompt("");
            setLoading(false);                 // clear input
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="rounded-lg border-none  shadow-lg flex flex-col gap-y-1">
            {/* Top */}
            <div className="flex bg-[#2A1384] px-1 py-1">
                <div className="flex gap-x-2">
                    <img
                        src={chatBotImage}
                        className="w-[50px] h-[50px] rounded-lg "
                    />
                </div>
            </div>

            {/* Text Area */}
            <div className="rounded-sm bg-white shadow-lg  text-gray-800 text-xs lg:text-sm p-2 min-h-[150px] max-h-[400px] overflow-auto flex flex-col">
                <div className='bg-gray-800 px-2 py-1 text-wrap flex justify-end rounded-md '>
                    <p className='text-white text-sm text-wrap w-full break-words '>
                        {showPromt}
                    </p>
                </div>
                <div className=''>
                    <h1 className='text-sm text-gray-800'>{response}</h1>
                </div>
                {loading && (<AiOutlineLoading className='text-purple-800 w-[30px] h-[30px] my-2' />)}
            </div>

            {/* Input - Bottom */}
            <div className="border-t rounded-sm text-xs lg:text-sm grid grid-cols-3 items-center pt-1 mb-1 text-wrap">
                <textarea
                    type="text"
                    placeholder="I am ready for you."
                    rows={1}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}          // 👈 update state
                    onKeyDown={(e) => e.key === "Enter" && sendPrompt()} // optional: send on Enter
                    className="bg-white text-xs lg:text-sm px-2 py-1 border-gray-800 rounded-md w-full text-wrap mx-1 my-1 col-span-2"
                />
                <button
                    type="button"
                    onClick={sendPrompt}                                  // 👈 send on click
                    className="border-none flex justify-center"
                >
                    <IoIosSend className="text-purple-800 w-[20px] h-[20px] rounded-lg hover:text-gray-600" />
                </button>
            </div>
        </div>
    );
};

export default ChatBot;
