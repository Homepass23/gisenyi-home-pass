"use client";
import React, { useState } from "react";
import { toast } from "sonner";

const Message = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    comment: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.subject.trim() || form.subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters.";
    }

    // Phone validation is optional - only validate if provided
    if (form.phone && !/^[0-9+\-\s()]*$/.test(form.phone)) {
      newErrors.phone = "Phone number contains invalid characters.";
    }

    if (!form.comment.trim() || form.comment.trim().length < 5) {
      newErrors.comment = "Comment must be at least 5 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setLoading(true);

    // Prepare data for submission (include phone now that it's in the database)
    const submitData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      comment: form.comment
    };

    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Message sent successfully! 🎉");
      setForm({ name: "", email: "", phone: "", subject: "", comment: "" });
    } else {
      const { error } = await res.json();
      toast.error("Error: " + error);
    }
  };

  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold mb-4">Let’s Talk</h2>
      <p className="text-gray-400 mb-8 leading-relaxed">
        We’d love to hear from you! Whether you’re interested in our services, have a partnership proposal, or need support, send us a message and our team will respond promptly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-full"
          />
          {errors.name && (
            <p className="text-sky-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-full"
          />
          {errors.email && (
            <p className="text-sky-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            type="tel"
            name="phone"
            placeholder="Phone number (optional)"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-full"
          />
          {errors.phone && (
            <p className="text-sky-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
        
        <div>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-full"
          />
          {errors.subject && (
            <p className="text-sky-500 text-sm mt-1">{errors.subject}</p>
          )}
        </div>


        <div>
          <textarea
            name="comment"
            placeholder="Comment"
            value={form.comment}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl h-24 resize-none"
          />
          {errors.comment && (
            <p className="text-sky-500 text-sm mt-1">{errors.comment}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-sky-500 hover:bg-sky-600"
          } text-white font-semibold px-8 py-2 rounded-full transition`}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default Message;