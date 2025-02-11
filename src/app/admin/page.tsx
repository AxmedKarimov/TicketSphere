"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";
import { createClient } from "../../../supabase/client";

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

type BuyedTicket = Ticket & { username: string };

const Admin: React.FC = () => {
  const initialTicketState: Ticket = {
    id: null,
    from: "",
    to: "",
    date: "",
    time: "",
    price: 0,
    count: 0,
    modelOfBus: "",
  };

  const [ticket, setTicket] = useState<Ticket>(initialTicketState);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [buyedTickets, setBuyedTickets] = useState<BuyedTicket[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      await fetchTickets();
      await fetchBuyedTickets();
    };
    fetchData();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data as Ticket[]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Fetch tickets error:", error.message);
      }
    }
  };

  const fetchBuyedTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("buyedTickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBuyedTickets(data as BuyedTicket[]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Fetch buyed tickets error:", error.message);
      }
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue =
      name === "price" || name === "count" ? Number(value) : value;
    setTicket({ ...ticket, [name]: parsedValue });
  };

  const handleSaveOrUpdate = async () => {
    if (
      !ticket.from ||
      !ticket.to ||
      !ticket.date ||
      !ticket.time ||
      ticket.price <= 0 ||
      ticket.count <= 0 ||
      !ticket.modelOfBus
    ) {
      console.log("Barcha maydonlar to'ldirilishi shart!");
      return;
    }

    try {
      let error;
      if (ticket.id) {
        const { error: updateError } = await supabase
          .from("tickets")
          .update({
            from: ticket.from,
            to: ticket.to,
            date: ticket.date,
            time: ticket.time,
            price: ticket.price,
            count: ticket.count,
            modelOfBus: ticket.modelOfBus,
          })
          .eq("id", ticket.id);

        error = updateError;
      } else {
        const ticketWithoutId = {
          from: ticket.from,
          to: ticket.to,
          date: ticket.date,
          time: ticket.time,
          price: ticket.price,
          count: ticket.count,
          modelOfBus: ticket.modelOfBus,
        };
        const { error: insertError } = await supabase
          .from("tickets")
          .insert([ticketWithoutId]);
        error = insertError;
      }

      if (error) throw error;

      setTicket(initialTicketState);
      await fetchTickets();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Supabase error:", error.message);
      }
    }
  };

  const handleEdit = (t: Ticket) => {
    setTicket(t);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    try {
      const { error } = await supabase.from("tickets").delete().eq("id", id);
      if (error) throw error;
      await fetchTickets();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Delete error:", error.message);
      }
    }
  };

  return (
    <div className="p-3">
      <Link href={"/"} className="btn btn-primary">
        back
      </Link>
      <h1 className="text-5xl font-bold mb-5 text-center">Admin Page</h1>
      <div className="flex flex-wrap justify-center items-start gap-7">
        <div className="card p-3 w-80 mx-auto">
          <h2 className="text-2xl font-bold mb-3">Ticket Form</h2>
          <select
            className="form-control w-full mb-4"
            name="from"
            value={ticket.from}
            onChange={handleChange}
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
          {/* Repeat other input fields similarly */}
          <button
            className={`btn ${
              ticket.id ? "btn-warning" : "btn-primary"
            } w-full`}
            onClick={handleSaveOrUpdate}
          >
            {ticket.id ? "Update Ticket" : "Save Ticket"}
          </button>
        </div>

        {/* Tickets and Buyed Tickets tables */}
      </div>
    </div>
  );
};

export default Admin;
