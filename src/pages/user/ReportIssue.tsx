
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle } from "lucide-react";
import { useCases } from "@/hooks/useCases";

// Form schema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide a detailed description (at least 20 characters)"),
});

type FormData = z.infer<typeof formSchema>;

const ReportIssue: React.FC = () => {
  const navigate = useNavigate();
  const { ticketId, purchaseId } = useParams();
  const { createCase, isLoading } = useCases();

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!ticketId || !purchaseId) {
      return;
    }

    const result = await createCase({
      ticket_id: ticketId,
      purchase_id: purchaseId,
      title: data.title,
      description: data.description,
    });

    if (result) {
      navigate("/user/cases");
    }
  };

  if (!ticketId || !purchaseId) {
    return (
      <Layout>
        <div className="container mx-auto py-12 text-center px-4">
          <AlertTriangle className="h-16 w-16 mx-auto text-betting-accent mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invalid Request</h2>
          <p className="text-muted-foreground mb-6">
            Unable to report an issue for this purchase. Invalid ticket or purchase ID.
          </p>
          <Button
            onClick={() => navigate("/buyer/purchases")}
            variant="default"
            className="bg-betting-green hover:bg-betting-green-dark"
          >
            Return to Purchases
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Report an Issue</h1>

        <div className="max-w-2xl mx-auto">
          <Card className="betting-card">
            <CardHeader>
              <CardTitle>Report a Problem</CardTitle>
              <CardDescription>
                Fill out the form below to report an issue with your purchase
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Briefly describe your issue"
                            {...field}
                            className="bg-betting-light-gray border-betting-light-gray"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide a detailed description of your issue..."
                            rows={6}
                            {...field}
                            className="bg-betting-light-gray border-betting-light-gray"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-betting-green hover:bg-betting-green-dark"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ReportIssue;
