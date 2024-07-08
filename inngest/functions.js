// "@/inngest/functions.js"

import { inngest } from "./client";
import {
  updateIsFetching,
  updateFetchErrorMessage,
  getLocationInfo,
  generateResponse,
  generateInsights,
  updateSelectedLocation,
} from "@/utils/actionsHelpers";
import axios from "axios";
import pLimit from "p-limit";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { event, body: "Hello, World!" };
  }
);

const limit = pLimit(2);

export const fetchYelpReviews = inngest.createFunction(
  { id: "fetch-yelp-reviews" },
  { event: "fetch/yelp.reviews" },
  async ({ event, step }) => {
    const { yelpBusinessLink, locationId, clerkId } = event.data;

    try {
      const result = await step.run("Fetch Yelp Reviews", async () => {
        await updateIsFetching("true", clerkId);
        await updateFetchErrorMessage("", clerkId);

        return await fetchYelpReviewsLogic(
          yelpBusinessLink,
          locationId,
          clerkId
        );
      });

      await updateSelectedLocation(locationId, yelpBusinessLink);
      await updateIsFetching("false", clerkId);

      return { success: true, ...result };
    } catch (error) {
      console.error(`Error in Inngest function: ${error.message}`);
      await updateIsFetching(false, clerkId);
      await updateFetchErrorMessage(error.message, clerkId);
      return { success: false, error: error.message };
    }
  }
);

async function fetchYelpReviewsLogic(yelpBusinessLink, locationId, clerkId) {
  const alias = yelpBusinessLink.split("/").pop();
  try {
    const initialResponse = await postYelpReviewTask(alias, 10);

    if (!initialResponse.tasks || initialResponse.tasks.length === 0) {
      throw new Error("No tasks found in response.");
    }

    const taskId = initialResponse.tasks[0].id;
    const initialResults = await pollYelpResults(taskId);

    if (!initialResults.success) {
      throw new Error(initialResults.message);
    }

    const totalReviews = initialResults.totalReviews;

    if (totalReviews > 10) {
      const fullResponse = await postYelpReviewTask(alias, totalReviews);
      const fullTaskId = fullResponse.tasks[0].id;
      const allReviews = await pollYelpResults(fullTaskId);

      if (!allReviews.success) {
        throw new Error(allReviews.message);
      }

      console.log(`All reviews fetched —> `, allReviews.reviews.length);

      const fetchedAllReviews = allReviews.reviews;
      const { data: locationData } = await getLocationInfo(locationId);

      console.log("Location Data fetched —> ", locationData);
      const { name_of_contact, position_of_contact, organization_name } =
        locationData;

      //   const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      //   const processReviews = fetchedAllReviews.map((review) =>
      //     limit(async () => {
      //       await delay(3000);

      //       const rating = review.rating.value;
      //       const customer_name = review.user_profile.name;
      //       const review_text = review.review_text;

      //       try {
      //         const response = await retryRequest(() =>
      //           generateResponse(
      //             organization_name,
      //             name_of_contact,
      //             position_of_contact,
      //             rating,
      //             customer_name,
      //             review_text
      //           )
      //         );

      //         const insights = await retryRequest(() =>
      //           generateInsights(
      //             organization_name,
      //             name_of_contact,
      //             position_of_contact,
      //             rating,
      //             customer_name,
      //             review_text
      //           )
      //         );

      //         console.log("Generated Response —> ", response);
      //         console.log("Generated Insights —> ", insights);

      //         return { response, insights };
      //       } catch (error) {
      //         console.error("Error processing review:", error);
      //         return { error: error.message };
      //       }
      //     })
      //   );
      //   await Promise.all(processReviews);

      return {
        success: true,
        reviews: allReviews.reviews,
        totalReviews: allReviews.totalReviews,
      };
    }

    // Only working with Initial Reviews for now
    const { data: locationData } = await getLocationInfo(locationId);

    console.log("Location Data fetched —> ", locationData);
    const { name_of_contact, position_of_contact, organization_name } =
      locationData;

    console.log(
      "Initial reviews fetched before calling AI —> ",
      initialResults.reviews
    );

    const fetchedReviews = initialResults.reviews;
    // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // const processReviews = fetchedReviews.map((review) =>
    //   limit(async () => {
    //     await delay(3000);

    //     const rating = review.rating.value;
    //     const customer_name = review.user_profile.name;
    //     const review_text = review.review_text;

    //     try {
    //       const response = await retryRequest(() =>
    //         generateResponse(
    //           organization_name,
    //           name_of_contact,
    //           position_of_contact,
    //           rating,
    //           customer_name,
    //           review_text
    //         )
    //       );

    //       const insights = await retryRequest(() =>
    //         generateInsights(
    //           organization_name,
    //           name_of_contact,
    //           position_of_contact,
    //           rating,
    //           customer_name,
    //           review_text
    //         )
    //       );

    //       console.log("Generated Response —> ", response);
    //       console.log("Generated Insights —> ", insights);

    //       return { response, insights };
    //     } catch (error) {
    //       console.error("Error processing review:", error);
    //       return { error: error.message };
    //     }
    //   })
    // );
    // await Promise.all(processReviews);

    return {
      success: true,
      reviews: initialResults.reviews,
      totalReviews: initialResults.totalReviews,
    };
  } catch (error) {
    console.log(`Yelp fetching error —> `, error);
    return {
      success: false,
      message: `Failed to fetch Yelp reviews: ${error.message}`,
    };
  }
}

async function pollYelpResults(taskId) {
  const maxAttempts = 999; // Reduced for faster error detection
  const pollingInterval = 30000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios({
        method: "get",
        url: `https://api.dataforseo.com/v3/business_data/yelp/reviews/task_get/${taskId}`,
        auth: {
          username: "0986881@lbcc.edu",
          password: "4045d2967d70b68e",
        },
        headers: { "content-type": "application/json" },
      });

      console.log(
        `Polling attempt ${attempt + 1}, status code: ${response.status}`
      );

      if (response.data.tasks && response.data.tasks[0].status_code === 20000) {
        const result = response.data.tasks[0].result[0];

        if (!result || result.reviews_count === null) {
          return { success: false, message: "No reviews found in response" };
        }

        return {
          success: true,
          reviews: result.items,
          totalReviews: result.reviews_count,
        };
      }

      if (attempt === maxAttempts - 1) {
        return { success: false, message: "Max polling attempts reached" };
      }

      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    } catch (error) {
      console.error("Error polling Yelp results:", error);
      return {
        success: false,
        message: `Error polling Yelp results: ${error.message}`,
      };
    }
  }

  return { success: false, message: "Timeout while fetching Yelp reviews" };
}

async function postYelpReviewTask(alias, depth) {
  try {
    const response = await axios({
      method: "post",
      url: "https://api.dataforseo.com/v3/business_data/yelp/reviews/task_post",
      auth: {
        username: "0986881@lbcc.edu",
        password: "4045d2967d70b68e",
      },
      data: [
        {
          language_name: "English",
          alias: alias,
          depth: depth,
        },
      ],
      headers: { "content-type": "application/json" },
    });

    console.log("Task posted —> ", response.data);
    return response.data;
  } catch (error) {
    console.error(`HTTP error! Status: ${error.response?.status}`);
    throw new Error(`HTTP error! Status: ${error.response?.status}`);
  }
}
