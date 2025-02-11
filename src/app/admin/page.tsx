"use client";
import React, { useState, ChangeEvent } from "react";
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

  const fetchTickets = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTickets(data as Ticket[]);
    } catch (error: any) {
      console.error("Fetch tickets error:", error.message);
    }
  };

  const fetchBuyedTickets = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("buyedTickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setBuyedTickets(data as BuyedTicket[]);
    } catch (error: any) {
      console.error("Fetch buyed tickets error:", error.message);
    }
  };

  fetchTickets();
  fetchBuyedTickets();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    const parsedValue =
      name === "price" || name === "count" ? parseFloat(value) : value;
    setTicket({ ...ticket, [name]: parsedValue });
  };

  const handleSaveOrUpdate = async (): Promise<void> => {
    if (
      !ticket.from ||
      !ticket.to ||
      !ticket.date ||
      !ticket.time ||
      !ticket.price ||
      !ticket.count ||
      !ticket.modelOfBus
    ) {
      console.log("Barcha maydonlar to'ldirilishi shart!");
      return;
    }

    try {
      let error;
      if (ticket.id) {
        ({ error } = await supabase
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
          .eq("id", ticket.id));
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
        ({ error } = await supabase.from("tickets").insert([ticketWithoutId]));
      }

      if (error) throw error;

      setTicket(initialTicketState);
      fetchTickets();
    } catch (error: any) {
      console.error("Supabase error:", error.message);
    }
  };

  const handleEdit = (t: Ticket): void => {
    setTicket(t);
  };

  const handleDelete = async (id: number | null): Promise<void> => {
    if (!id) return;
    try {
      const { error } = await supabase.from("tickets").delete().eq("id", id);
      if (error) throw error;
      fetchTickets();
    } catch (error: any) {
      console.error("Delete error:", error.message);
    }
  };

  return (
    <div className="p-3">
      <Link href="/" className="btn btn-primary">
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
          <select
            className="form-control w-full mb-4"
            name="to"
            value={ticket.to}
            onChange={handleChange}
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
          <input
            type="date"
            className="form-control w-full mb-4"
            name="date"
            value={ticket.date}
            onChange={handleChange}
          />
          <select
            className="form-control w-full mb-4"
            name="time"
            value={ticket.time}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select Time
            </option>
            {[
              "06:00",
              "08:00",
              "10:00",
              "12:00",
              "14:00",
              "16:00",
              "18:00",
              "20:00",
            ].map((timeOption) => (
              <option key={timeOption} value={timeOption}>
                {timeOption}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="form-control w-full mb-4"
            name="price"
            placeholder="Price"
            value={ticket.price}
            onChange={handleChange}
          />
          <input
            type="number"
            className="form-control w-full mb-4"
            name="count"
            placeholder="Count"
            value={ticket.count}
            onChange={handleChange}
          />
          <select
            className="form-control w-full mb-4"
            name="modelOfBus"
            value={ticket.modelOfBus}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select Bus Model
            </option>
            {[
              "Mercedes-Benz",
              "Isuzu",
              "Yutong",
              "Higer",
              "MAN",
              "Scania",
              "Raketa",
            ].map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <button
            className={`btn ${
              ticket.id ? "btn-warning" : "btn-primary"
            } w-full`}
            onClick={handleSaveOrUpdate}
          >
            {ticket.id ? "Update Ticket" : "Save Ticket"}
          </button>
        </div>

        <div className="w-full lg:w-2/3">
          <h2 className="text-2xl font-bold mb-3">Barcha Ticketlar</h2>
          <table className="table table-striped table-hover border table-dark mb-5">
            <thead>
              <tr>
                <th>ID</th>
                <th>From</th>
                <th>To</th>
                <th>Date</th>
                <th>Time</th>
                <th>Price</th>
                <th>Count</th>
                <th>Model</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t, index) => (
                <tr key={index}>
                  <td>{t.id}</td>
                  <td>{t.from}</td>
                  <td>{t.to}</td>
                  <td>{t.date}</td>
                  <td>{t.time}</td>
                  <td>{t.price}</td>
                  <td>{t.count}</td>
                  <td>{t.modelOfBus}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm mx-1"
                      onClick={() => handleEdit(t)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm mx-1"
                      onClick={() => handleDelete(t.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="text-2xl font-bold mb-3">Sotib Olingan Ticketlar</h2>
          <table className="table table-striped table-hover border table-info">
            <thead className="table-dark">
              <tr>
                <th>Username</th>
                <th>From</th>
                <th>To</th>
                <th>Date</th>
                <th>Time</th>
                <th>Price</th>
                <th>Model</th>
              </tr>
            </thead>
            <tbody>
              {buyedTickets.map((bt, index) => (
                <tr key={index}>
                  <td>{bt.username}</td>
                  <td>{bt.from}</td>
                  <td>{bt.to}</td>
                  <td>{bt.date}</td>
                  <td>{bt.time}</td>
                  <td>{bt.price}</td>
                  <td>{bt.modelOfBus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
