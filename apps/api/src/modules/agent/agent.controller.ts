import { Body, Controller, Headers, Post, UnauthorizedException } from "@nestjs/common";
import { AgentService } from "./agent.service";

type AgentQueryDto = {
  type: "tools" | "cases" | "claw";
  q?: string;
};

type AgentWebhookDto = {
  event: string;
  payload: Record<string, unknown>;
};

@Controller("agent")
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post("query")
  query(@Headers("x-api-key") apiKey: string | undefined, @Body() body: AgentQueryDto) {
    const expectedKey = process.env.AGENT_API_KEY;
    if (!expectedKey || apiKey !== expectedKey) {
      throw new UnauthorizedException("invalid api key");
    }

    return this.agentService.query(body);
  }

  @Post("webhook")
  webhook(
    @Headers("x-webhook-signature") signature: string | undefined,
    @Body() body: AgentWebhookDto,
  ) {
    const expected = process.env.WEBHOOK_SIGNING_SECRET;
    const signatureValid = Boolean(expected && signature && signature === expected);
    if (!signatureValid) {
      throw new UnauthorizedException("invalid webhook signature");
    }

    return this.agentService.buildWebhookAck(body.event, signatureValid);
  }
}
