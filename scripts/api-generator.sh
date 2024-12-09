#!/bin/bash

# Check if correct arguments are passed
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <slice-name> <endpoint-url>"
  echo "Example: $0 user /users"
  exit 1
fi

SLICE_NAME=$1
ENDPOINT_URL=$2

API_DIR="src/redux/api"
SLICE_FILE="$API_DIR/$SLICE_NAME.ts"

# Create API directory if it doesn't exist
if [ ! -d "$API_DIR" ]; then
  mkdir -p "$API_DIR"
  echo "Created directory: $API_DIR"
fi

# Create the API slice file
cat > "$SLICE_FILE" <<EOL
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = \`\${process.env.NEXT_PUBLIC_API_URL}$ENDPOINT_URL\`;

export const ${SLICE_NAME}Api = createApi({
  reducerPath: "$SLICE_NAME",
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    fetchData: builder.query<any, void>({
      query: () => "/",
    }),
    createData: builder.mutation<any, any>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useFetchDataQuery, useCreateDataMutation } = ${SLICE_NAME}Api;
EOL

echo "API slice created at: $SLICE_FILE"
echo "Script execution completed."


# usegae
# sh scripts/api-generator.sh user /users