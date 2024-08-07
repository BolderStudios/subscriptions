// components/Onboarding.jsx

"use client";

import { useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { useLocalStorage } from "@uidotdev/usehooks";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandItem,
} from "@/components/ui/command.jsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { completeOnboarding } from "@/app/onboarding/_actions";
import Logo from "@/public/logoBlack.png";
import { Button } from "@/components/ui/Buttons/button";
import { ButtonLoading } from "@/components/ui/Buttons/ButtonLoading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const industries = [
  { value: "restaurant", label: "Restaurant" },
  { value: "general-contractor", label: "General Contractor" },
  { value: "handyman", label: "Handyman" },
  { value: "real-estate", label: "Real Estate" },
  { value: "retail", label: "Retail" },
  { value: "healthcare", label: "Healthcare" },
  { value: "technology", label: "Technology" },
  { value: "cafe-bakery", label: "Café/Bakery" },
  { value: "juice-bar-smoothie-shop", label: "Juice Bar/Smoothie Shop" },
  { value: "nail-salon", label: "Nail Salon" },
  { value: "barbershop", label: "Barbershop" },
  { value: "hair-salon", label: "Hair Salon" },
  { value: "beauty-salon-spa", label: "Beauty Salon/Spa" },
  { value: "yoga-studio", label: "Yoga Studio" },
  { value: "gym-fitness-center", label: "Gym/Fitness Center" },
  { value: "coffee-shop", label: "Coffee Shop" },
];

const positions = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
  { value: "supervisor", label: "Supervisor" },
];

const numberOfCustomers = [
  { value: "less than 10", label: "Less than 10" },
  { value: "10 to 50", label: "10 to 50" },
  { value: "51 to 200", label: "51 to 200" },
  { value: "201 to 1000", label: "201 to 1000" },
  { value: "more than 1000", label: "More than 1000" },
];

const formSchema = z.object({
  organizationName: z.string().min(1, "Business name is required"),
  organizationIndustry: z.string().min(1, "Please select an industry"),
  positionOfContact: z.string().min(1, "Please select a position"),
  nameOfContact: z.string().min(1, "Review overseer's name is required"),
  employeeCount: z.coerce.number().min(1, "Add number of employees you have"),
  customersCount: z.coerce
    .string()
    .min(1, "Add number of customers visit daily"),
  painPoints: z
    .string()
    .min(1, "Describe how you currently ask customers for testimonials"),
});

export default function OnboardingComponent() {
  const user = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [openIndustry, setOpenIndustry] = useState(false);
  const [openPosition, setOpenPosition] = useState(false);
  const [openCustomersCount, setOpenCustomersCount] = useState(false);
  const [onboardingForm, setOnboardingForm] = useLocalStorage(
    "onboarding_form",
    {
      organizationName: "",
      organizationIndustry: "",
      employeeCount: "",
      customersCount: "",
      painPoints: "",
      nameOfContact: "",
      positionOfContact: "",
    }
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: onboardingForm,
  });

  const formValues = form.watch();

  useEffect(() => {
    setOnboardingForm(formValues);
  }, [formValues, setOnboardingForm]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);

    try {
      await completeOnboarding(formData);
      toast.success("Onboarding complete 🎉");
      router.push("/dashboard");

      form.reset({
        organizationName: "",
        organizationIndustry: "",
        employeeCount: "",
        customersCount: "",
        painPoints: "",
        nameOfContact: "",
        positionOfContact: "",
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen relative flex items-center justify-center">
      {/* Go Back button */}
      <div className="absolute top-4 left-4">
        <SignOutButton redirectUrl="/sign-in">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-[6px]"
          >
            <ArrowLeft size={14} className="mt-[1px]" />
            <p className="leading-7">Signout</p>
          </Button>
        </SignOutButton>
      </div>

      {/* Main onboarding component */}
      <div className="w-[600px] py-6 px-8">
        <div className="flex flex-col items-center justify-center mb-6">
          <Image
            src={Logo}
            alt="Brand Armor Logo"
            width={99}
            height={10}
            priority
          />
        </div>

        <div className="flex flex-col text-center gap-2 mb-10">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-stone-900">
            Complete Your Profile
          </h4>
          <p className="leading-5 text-stone-700">
            Please provide some information about your business.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, (errors) => {
              // Display toast for each error
              Object.values(errors).forEach((error) => {
                toast.error(error.message);
              });
            })}
            className="space-y-4"
          >
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel
                      className="text-foreground"
                      htmlFor="organizationName"
                    >
                      What is your company called?
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="organizationName"
                        placeholder="Enter business name"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organizationIndustry"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel
                      className="text-foreground"
                      htmlFor="organizationIndustry"
                    >
                      What type of business is it?
                    </FormLabel>
                    <Popover open={openIndustry} onOpenChange={setOpenIndustry}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openIndustry}
                            className="w-full justify-between"
                          >
                            {field.value
                              ? industries.find(
                                  (industry) => industry.value === field.value
                                )?.label
                              : "Select industry..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[260px] p-0">
                        <Command className="w-full">
                          <CommandGroup className="w-full">
                            <CommandList className="w-full">
                              {industries?.map((industry) => (
                                <CommandItem
                                  key={`industry-${industry.value}`}
                                  value={industry.value}
                                  className="w-full"
                                  onSelect={(value) => {
                                    field.onChange(value);
                                    setOpenIndustry(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === industry.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {industry.label}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="nameOfContact"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel
                      className="text-foreground"
                      htmlFor="nameOfContact"
                    >
                      Who is the point of contact?
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="nameOfContact"
                        placeholder="Enter first name"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="positionOfContact"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel
                      className="text-foreground"
                      htmlFor="positionOfContact"
                    >
                      What is their position?
                    </FormLabel>
                    <Popover open={openPosition} onOpenChange={setOpenPosition}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openPosition}
                            className="w-full justify-between"
                          >
                            {field.value
                              ? positions.find(
                                  (position) => position.value === field.value
                                )?.label
                              : "Select position..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[260px] p-0">
                        <Command className="w-full">
                          <CommandEmpty className="w-full">
                            No position found.
                          </CommandEmpty>
                          <CommandGroup className="w-full">
                            <CommandList className="w-full">
                              {positions.map((position) => (
                                <CommandItem
                                  key={`position-${position.value}`}
                                  value={position.value}
                                  className="w-full"
                                  onSelect={(value) => {
                                    field.onChange(value);
                                    setOpenPosition(false);
                                  }}
                                >
                                  <div className="flex items-center w-full">
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 flex-shrink-0",
                                        field.value === position.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <span className="flex-grow">
                                      {position.label}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="employeeCount"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel
                      className="text-foreground"
                      htmlFor="employeeCount"
                    >
                      How many employees do you have?
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="employeeCount"
                        placeholder="Enter number of employees"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customersCount"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel
                      className="text-foreground"
                      htmlFor="customersCount"
                    >
                      How many customers visit daily?
                    </FormLabel>
                    <Popover
                      open={openCustomersCount}
                      onOpenChange={setOpenCustomersCount}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCustomersCount}
                            className="w-full justify-between"
                          >
                            {field.value
                              ? numberOfCustomers.find(
                                  (count) => count.value === field.value
                                )?.label
                              : "Select customer count..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[260px] p-0">
                        <Command className="w-full">
                          <CommandEmpty className="w-full">
                            No customer count option found.
                          </CommandEmpty>
                          <CommandGroup className="w-full">
                            <CommandList className="w-full">
                              {numberOfCustomers.map((count) => (
                                <CommandItem
                                  key={`count-${count.value}`}
                                  value={count.value}
                                  className="w-full"
                                  onSelect={(value) => {
                                    field.onChange(value);
                                    setOpenCustomersCount(false);
                                  }}
                                >
                                  <div className="flex items-center w-full">
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 flex-shrink-0",
                                        field.value === count.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <span className="flex-grow">
                                      {count.label}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="painPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground" htmlFor="painPoints">
                    Current testimonial request process
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="painPoints"
                      placeholder="Describe how you currently ask customers for testimonials (e.g., email, in person, automated system)"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormMessage className="text-muted-foreground text-xs">
              By completing this form, you agree to our{" "}
              <Link href="/terms" className="underline">
                Terms of Service
              </Link>{" "}
            </FormMessage>

            <div>
              {isLoading ? (
                <ButtonLoading
                  size="lg"
                  width="w-full"
                  content="Completing onboarding ..."
                />
              ) : (
                <Button type="submit" size="lg" className="w-full">
                  Complete Onboarding
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
