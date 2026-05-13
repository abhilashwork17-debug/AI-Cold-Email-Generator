import React, { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

const History = () => {
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (user?.token) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/ai/history", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setHistory(data);
    } catch (error) {
      toast.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);

    toast.success("Copied!");

    setTimeout(() => {
      setCopied("");
    }, 2000);
  };

  const Card = ({ title, content, id }) => (
    <div className="bg-[#111111] p-5 rounded-2xl border border-gray-800 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-white">{title}</h3>

        <button
          onClick={() => copyToClipboard(content, id)}
          className="text-gray-400 hover:text-purple-300"
        >
          {copied === id ? (
            <CheckIcon className="w-5 h-5 text-green-400" />
          ) : (
            <ClipboardDocumentIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="text-sm text-gray-300 whitespace-pre-line leading-7">
        {content}
      </div>
    </div>
  );

  /* Redirect guest users */
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        Loading history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white px-6 py-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Generation History</h1>

          <p className="text-gray-400 mt-1">Your saved outreach campaigns</p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/dashboard"
            className="px-5 py-3 rounded-full bg-purple-400 text-black font-semibold hover:bg-purple-300"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="max-w-4xl mx-auto bg-[#111111] border border-gray-800 rounded-2xl p-10 text-center text-gray-400">
          No history found yet.
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-8">
          {history.map((item, index) => (
            <div
              key={item._id}
              className="bg-[#0d0d0d] border border-gray-800 rounded-3xl p-6"
            >
              {/* Top */}
              <div className="mb-5 border-b border-gray-800 pb-4">
                <h2 className="text-xl font-semibold text-purple-300">
                  Campaign #{history.length - index}
                </h2>

                <p className="text-xs text-gray-500 mt-2">
                  {new Date(item.createdAt).toLocaleString()}
                </p>

                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Prompt Used:</p>

                  <div className="bg-[#111111] rounded-xl p-4 text-sm text-gray-300 whitespace-pre-line leading-7">
                    {item.prompt}
                  </div>
                </div>
              </div>

              {/* Output Cards */}
              <Card
                title="Subject Line"
                content={item.subject}
                id={`sub-${item._id}`}
              />

              <Card
                title="Cold Email"
                content={item.emailBody}
                id={`mail-${item._id}`}
              />

              <Card
                title="LinkedIn DM"
                content={item.linkedInDM}
                id={`link-${item._id}`}
              />

              <Card
                title="Follow-up Email"
                content={item.followUpEmail}
                id={`follow-${item._id}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
