"use client";
import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/utils/cn";

export function Form() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload
  
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
  
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        alert("✅ Message sent successfully!"); // Show success message
        e.currentTarget.reset(); // Clear form after submission
      }
    } catch (error) {
      console.error("Error:", error);
      // ❌ Removed the alert("⚠️ Something went wrong!") to avoid extra popups
    }
  };

  return (
    <div className="max-w-md rounded-md w-full mx-auto md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-sm md:text-xl text-neutral-800 dark:text-neutral-200">
        Connect with Team
      </h2>
      <p className="text-neutral-600 text-[10px] md:text-[14px] md:text-sm max-w-sm mt-2 dark:text-neutral-300">
        Chipset
      </p>

      {/* ✅ Single Form (No Nested Forms) */}
      <form className="my-8" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="firstname" className="text-[10px] md:text-[14px]">
              First name
            </Label>
            <Input id="firstname" name="firstname" type="text" required />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname" className="text-[10px] md:text-[14px]">
              Last name
            </Label>
            <Input id="lastname" name="lastname" type="text" required />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email" className="text-[10px] md:text-[14px]">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            placeholder="xxxxxx@srmist.edu.com"
            type="email"
            required
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <Label htmlFor="query" className="text-[10px] md:text-[14px]">
            Your Query
          </Label>
          <textarea
            id="query"
            name="query"
            className="border-yellow-400 bg-slate-100 outline-none rounded-sm md:rounded-md p-2 font-typer text-[10px] md:text-[14px]"
            placeholder="Write your query here..."
            required
          />
        </LabelInputContainer>
        <button
          className="bg-gradient-to-br relative group/btn from-[#f39e2f] dark:from-orange-500 dark:to-orange-400 to-orange-700 block w-full text-white text-[10px] md:text-[14px] rounded-md h-8 md:h-10 font-medium"
          type="submit"
        >
          Submit &rarr;
        </button>
      </form>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
