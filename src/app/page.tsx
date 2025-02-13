"use client";
import React, { useState, useCallback, useMemo, ChangeEvent } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";
import { createClient } from "../../supabase/client";
import Image from "next/image";

type Ticket = {
  id: number | null;
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  count: number;
  modelOfBus: string;
  created_at?: string;
};


export default function Home() {
  const [searchParams, setSearchParams] = useState<{
    from: string;
    to: string;
  }>({ from: "", to: "" });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>("");

  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const fetchTickets = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("tickets").select("*");
      if (error) throw error;
      setTickets(data as Ticket[]);
      setFilteredTickets(data as Ticket[]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching tickets:", error.message);
      }
    }
  }, [supabase]);

  const fetchBuyedTickets = useCallback(async () => {
    try {
      const { error } = await supabase.from("buyedTickets").select("*");
      if (error) throw error;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching buyed tickets:", error.message);
      }
    }
  }, [supabase]);

  fetchTickets();
  fetchBuyedTickets();

  const handleChange = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setSearchParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = () => {
    if (!searchParams.from || !searchParams.to) {
      alert("Iltimos, FROM va TO maydonlarini tanlang!");
      return;
    }
    const results = tickets.filter(
      (ticket) =>
        ticket.from === searchParams.from && ticket.to === searchParams.to
    );
    setFilteredTickets(results);
  };

  const handleBuy = async (ticket: Ticket, index: number) => {
    const username = prompt("Iltimos, foydalanuvchi ismingizni kiriting:");
    if (!username) return;

    try {
      const { error: insertError } = await supabase
        .from("buyedTickets")
        .insert({
          ...ticket,
          username,
        });
      if (insertError) throw insertError;

      const newCount = ticket.count - 1;
      if (newCount > 0) {
        const { error: updateError } = await supabase
          .from("tickets")
          .update({ count: newCount })
          .eq("id", ticket.id);
        if (updateError) throw updateError;

        setFilteredTickets((prev) =>
          prev.map((t) => (t.id === ticket.id ? { ...t, count: newCount } : t))
        );
        setTickets((prev) =>
          prev.map((t) => (t.id === ticket.id ? { ...t, count: newCount } : t))
        );
      } else {
        const { error: deleteError } = await supabase
          .from("tickets")
          .delete()
          .eq("id", ticket.id);
        if (deleteError) throw deleteError;

        setFilteredTickets((prev) => prev.filter((t) => t.id !== ticket.id));
        setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
      }

      alert("Ticket muvaffaqiyatli sotib olindi!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error buying ticket:", error.message);
      }
      alert("Ticket sotib olishda xatolik yuz berdi!");
    }
  };

  const handleAdminClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setAdminPassword("");
  };

  const handleAdminSubmit = () => {
    if (adminPassword === "admin123") {
      router.push("/admin");
    } else {
      alert("Noto'g'ri parol!");
    }
    setAdminPassword("");
    setShowModal(false);
  };

  const handleAdminPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAdminPassword(e.target.value);
  };

  return (
    <div>
      <div className="w-full h-24 bg-slate-200 flex justify-around items-center">
        <Image
          className="w-20 rounded-full"
          src="/logo.webp"
          alt="Logo"
          width={100}
          height={100}
        />
        <h1 className="text-4xl">TicketSphere</h1>
        <button className="btn btn-secondary" onClick={handleAdminClick}>
          Admin?
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Admin Parol</h2>
            <input
              type="password"
              className="form-control mb-4"
              placeholder="Parolni kiriting"
              value={adminPassword}
              onChange={handleAdminPasswordChange}
            />
            <div className="flex justify-end gap-2">
              <button className="btn btn-secondary" onClick={handleModalClose}>
                Bekor qilish
              </button>
              <button className="btn btn-primary" onClick={handleAdminSubmit}>
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-screen bg-slate-100 p-4">
        <div className="w-3/5 mx-auto flex items-center justify-center gap-3">
          <select
            className="form-control w-48 mb-4"
            name="from"
            onChange={handleChange}
            defaultValue=""
          >
            <option value="" disabled>
              From
            </option>
            {[
              "Sirdaryo",
              "Navoiy",
              "Jizzax",
              "Xorazm",
              "Buxoro",
              "Surxondaryo",
              "Namangan",
              "Andijon",
              "Qashqadaryo",
              "Samarqand",
              "Fargʻona",
              "Toshkent",
            ].map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          <select
            className="form-control w-48 mb-4"
            name="to"
            onChange={handleChange}
            defaultValue=""
          >
            <option value="" disabled>
              To
            </option>
            {[
              "Sirdaryo",
              "Navoiy",
              "Jizzax",
              "Xorazm",
              "Buxoro",
              "Surxondaryo",
              "Namangan",
              "Andijon",
              "Qashqadaryo",
              "Samarqand",
              "Fargʻona",
              "Toshkent",
            ].map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          <button className="btn btn-secondary mb-4" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="w-3/5 mx-auto border-2 border-slate-600 rounded-lg h-3/5 overflow-auto p-3">
          {filteredTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTickets.map((ticket, index) => (
                <div
                  key={ticket.id ?? index}
                  className="bg-white shadow-lg rounded-lg p-4"
                >
                  <h3 className="text-xl font-semibold text-center">
                    {ticket.from} → {ticket.to}
                  </h3>
                  <p className="text-gray-700 text-center mt-2">
                    📅 {ticket.date} | 🕒 {ticket.time}
                  </p>
                  <p className="text-gray-700 text-center">
                    💰 {ticket.price} so'm
                  </p>
                  <p
                    className={`text-center ${
                      ticket.count > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {ticket.count > 0
                      ? `Yana ${ticket.count} ta mavjud`
                      : "Sotilgan!"}
                  </p>
                  <p className="text-gray-700 text-center">
                    🚍 {ticket.modelOfBus}
                  </p>
                  <button
                    className={`btn ${
                      ticket.count > 0
                        ? "btn-primary"
                        : "btn-secondary disabled"
                    } mt-4 w-full`}
                    onClick={() => handleBuy(ticket, index)}
                    disabled={ticket.count <= 0}
                  >
                    {ticket.count > 0 ? "Buy" : "Sold Out"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-lg text-gray-700">
              {searchParams.from && searchParams.to
                ? "Bu yo'nalishda ticket topilmadi!"
                : "Yo'nalishni tanlab qidiring."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
