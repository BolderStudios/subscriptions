"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink, QrCode } from "lucide-react";
import { SignedInLayout } from "@/app/layouts/SignedInLayout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Funnels({ selectedLocation, isFetching }) {
  let subdomain;
  let href;

  if (process.env.NEXT_PUBLIC_REDIRECT_URL.startsWith("localhost")) {
    subdomain = `${selectedLocation.id}.${process.env.NEXT_PUBLIC_REDIRECT_URL}`;
    href = `www.${subdomain}/templates/standard/yelp`;
  } else {
    subdomain = `${selectedLocation.id}.${process.env.NEXT_PUBLIC_REDIRECT_URL}`;
    href = `https://${subdomain}/templates/standard/yelp`;
  }

  const handleQRCodeClick = () => {
    console.log("QR code clicked");
  };

  return (
    <SignedInLayout>
      <div className="px-8 py-6">
        <h2 className="font-bold text-2xl mb-6">Templates</h2>

        <div>
          <Card className="w-[250px] p-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-md">Standard Yelp</CardTitle>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <QrCode
                          onClick={handleQRCodeClick}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate a QR-code</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Link href={href}>
                          <ExternalLink className="text-blue-500 w-4 h-4">
                            Preview
                          </ExternalLink>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Preview template</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <CardDescription className="text-sm text-gray-500">
                This is the most used template. Click blue icon to preview.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </SignedInLayout>
  );
}
