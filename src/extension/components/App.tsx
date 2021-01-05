import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { getMockEvents, getOrigin, isDevTools } from "../util";
import Events from "./Events";

export default function App() {
  const [origin, setOrigin] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getOrigin().then((origin) => {
      setOrigin(origin);

      const socket = io(origin, {
        path: "/.well-known/tracequest",
      });

      socket.on("connect", () => {
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("linking", (newEvent) => {
        setEvents((old) => [newEvent, ...old]);
      });

      socket.on("end", (newEvent) => {
        setEvents((old) =>
          old.map((e) => (e.id === newEvent.id ? newEvent : e))
        );
      });

      socket.on("stop", (newEvent) => {
        setEvents((old) => [newEvent, ...old]);
      });
    });
  }, []);

  return (
    <>
      <h4 className="status-header">
        {origin} {isConnected && " - connected"}
      </h4>
      <main>
        <Events events={events} />
      </main>
    </>
  );
}
