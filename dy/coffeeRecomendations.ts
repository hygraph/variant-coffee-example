interface DynamicYieldContext {
  user: {
    dyid: string;
    dyid_server: string;
  };
  session: {
    dy: string;
  };
  context: {
    page: {
      type: string;
      data: any[];
      location: string;
      locale: string;
    };
    device: {
      ip: string;
      userAgent: string;
    };
  };
}
interface DynamicRecommendationsRequest {
  selector: {
    names: string[];
  };

  options?: {
    isImplicitPageview?: boolean;
    returnAnalyticsMetadata?: boolean;
    isImplicitImpressionMode?: boolean;
    isImplicitClientData?: boolean;
    recsProductData?: {
      skusOnly: boolean;
    };
  };
}

interface ProductData {
  group_id: string;
  categories: string[];
  keywords: string[];
  in_stock: boolean;
  publish_time: string;
  name: string;
  url: string;
  image_url: string;
  price: number;
  dy_display_price: string;
  product_type: string;
}

interface Slot {
  sku: string;
  productData?: ProductData;
  slotId: string;
}

interface DynamicRecommendationsResponse {
  choices: {
    id: number;
    name: string;
    type: string;
    variations: {
      id: number;
      payload: {
        data: {
          slots: Slot[];
        };
        type: string;
      };
    }[];
    groups: any[];
    decisionId: string;
  }[];
  cookies: {
    name: string;
    value: string;
    maxAge: string;
  }[];
  warnings: {
    code: string;
    message: string;
  }[];
}

export async function getDynamicRecommendations(
  requestData: DynamicRecommendationsRequest & DynamicYieldContext,
): Promise<DynamicRecommendationsResponse> {
  const url = "https://dy-api.com/v2/serve/user/choose";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "dy-api-key": process.env.DY_API_KEY || "",
    },
    body: JSON.stringify(requestData),
  };

  const response = await fetch(url, options);
  return response.json();
}

export async function coffeeRecommendations(dyCtx: DynamicYieldContext) {
  const requestData: DynamicRecommendationsRequest & DynamicYieldContext = {
    ...dyCtx,
    selector: {
      names: ["testing-recommendation"],
    },
    options: {
      recsProductData: {
        skusOnly: true,
      },
    },
  };

  const resp = await getDynamicRecommendations(requestData);
  console.debug(JSON.stringify(resp, null, 2));

  return resp.choices[0].variations[0].payload.data.slots.map(
    (slot) => slot.sku,
  );
}

export const testingCtx: DynamicYieldContext = {
  user: {
    dyid: "00000000-0000-0000-0000-000000000000",
    dyid_server: "00000000-0000-0000-0000-000000000000",
  },
  session: {
    dy: "00000000-0000-0000-0000-000000000000",
  },
  context: {
    page: {
      type: "HOMEPAGE",
      data: [],
      location: "http://localhost/",
      locale: "en_US",
    },
    device: {
      ip: "8.8.4.4",
      userAgent: "Mozilla/5.0 (X11; ; U; Linux armv7l; en-us)",
    },
  },
};
