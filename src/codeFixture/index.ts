class FindObjectRequest {
  id: string
}

class FindObjectResponse {
  statusCode: number
  body: {
    id: string
    name: string
  }
}

const handler = async (req: FindObjectRequest): Promise<FindObjectResponse> => {
  return await new Promise((resolve, reject) => {
    resolve(new FindObjectResponse())
  })
}

export const index = handler
