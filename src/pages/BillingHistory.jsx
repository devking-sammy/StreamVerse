import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, app } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

export default function BillingHistory() {
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(
          collection(db, "payments"),
          where("uid", "==", user.uid),
          orderBy("date", "desc")
        );
        const querySnap = await getDocs(q);
        const data = querySnap.docs.map((doc) => doc.data());
        setPayments(data);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Billing History</h1>

      {payments.length > 0 ? (
        <div className="max-w-3xl mx-auto bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-800 text-gray-400 uppercase text-sm">
              <tr>
                <th className="p-4">Plan</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="p-4">{p.plan}</td>
                  <td className="p-4">₦{p.amount}</td>
                  <td className="p-4 text-green-400">{p.status}</td>
                  <td className="p-4">
                    {p.date?.toDate
                      ? p.date.toDate().toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-400 mt-12">
          No payments found yet.
        </p>
      )}
    </div>
  );
}
