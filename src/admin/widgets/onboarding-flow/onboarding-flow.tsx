import { WidgetConfig, WidgetProps } from "@medusajs/admin";
import { useAdminCustomPost, useAdminCustomQuery, useMedusa } from "medusa-react";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { OnboardingState } from "../../../models/onboarding";
import {
  AdminOnboardingUpdateStateReq,
  OnboardingStateRes,
  UpdateOnboardingStateInput,
} from "../../../types/onboarding";
import OrderDetailDefault from "../../components/onboarding-flow/default/orders/order-detail";
import OrdersListDefault from "../../components/onboarding-flow/default/orders/orders-list";
import ProductDetailDefault from "../../components/onboarding-flow/default/products/product-detail";
import ProductsListDefault from "../../components/onboarding-flow/default/products/products-list";
import { Button, Container, Heading, Text, clx } from "@medusajs/ui";
import Accordion from "../../components/shared/accordion";
import GetStarted from "../../components/shared/icons/get-started";
import { Order, Product } from "@medusajs/medusa";
import ProductsListNextjs from "../../components/onboarding-flow/nextjs/products/products-list";
import ProductDetailNextjs from "../../components/onboarding-flow/nextjs/products/product-detail";
import OrdersListNextjs from "../../components/onboarding-flow/nextjs/orders/orders-list";
import OrderDetailNextjs from "../../components/onboarding-flow/nextjs/orders/order-detail";

type STEP_ID =
  | "create_product"
  | "preview_product"
  | "create_order"
  | "setup_finished"
  | "create_product_nextjs"
  | "preview_product_nextjs"
  | "create_order_nextjs"
  | "setup_finished_nextjs"

export type StepContentProps = WidgetProps & {
  onNext?: Function;
  isComplete?: boolean;
  data?: OnboardingState;
};

type Step = {
  id: STEP_ID;
  title: string;
  component: React.FC<StepContentProps>;
  onNext?: Function;
};

const QUERY_KEY = ["onboarding_state"];

const OnboardingFlow = (props: WidgetProps) => {
  // create custom hooks for custom endpoints
  const { data, isLoading } = useAdminCustomQuery<
    undefined,
    OnboardingStateRes
  >("/onboarding", QUERY_KEY);
  const { mutate } = useAdminCustomPost<
    AdminOnboardingUpdateStateReq,
    OnboardingStateRes
  >("/onboarding", QUERY_KEY);

  const navigate = useNavigate();
  // will be used if onboarding step
  // is passed as a path parameter
  const { client } = useMedusa();

  // get current step from custom endpoint
  const currentStep: STEP_ID | undefined = useMemo(() => {
    return data?.status
    ?.current_step as STEP_ID
  }, [data]);

  // initialize some state
  const [openStep, setOpenStep] = useState(currentStep);
  const [completed, setCompleted] = useState(false);

  // this method is used to move from one step to the next
  const setStepComplete = ({
    step_id,
    extraData,
    onComplete,
  }: {
    step_id: STEP_ID;
    extraData?: UpdateOnboardingStateInput;
    onComplete?: () => void;
  }) => {
    const next = steps[findStepIndex(step_id) + 1];
    mutate({ current_step: next.id, ...extraData }, {
      onSuccess: onComplete
    });
  };

  // this is useful if you want to change the current step
  // using a path parameter. It can only be changed if the passed
  // step in the path parameter is the next step.
  const [ searchParams ] = useSearchParams()

  // the steps are set based on the 
  // onboarding type
  const steps: Step[] = useMemo(() => {
    {
      switch(process.env.MEDUSA_ADMIN_ONBOARDING_TYPE) {
        case 'nextjs':
          return [
            {
              id: "create_product_nextjs",
              title: "Create Product",
              component: ProductsListNextjs,
              onNext: (product: Product) => {
                setStepComplete({
                  step_id: "create_product_nextjs",
                  extraData: { product_id: product.id },
                  onComplete: () => navigate(`/a/products/${product.id}`),
                });
              },
            },
            {
              id: "preview_product_nextjs",
              title: "Preview Product",
              component: ProductDetailNextjs,
              onNext: () => {
                setStepComplete({
                  step_id: "preview_product_nextjs",
                  onComplete: () => navigate(`/a/orders`),
                });
              },
            },
            {
              id: "create_order_nextjs",
              title: "Create an Order",
              component: OrdersListNextjs,
              onNext: (order: Order) => {
                setStepComplete({
                  step_id: "create_order_nextjs",
                  onComplete: () => navigate(`/a/orders/${order.id}`),
                });
              },
            },
            {
              id: "setup_finished_nextjs",
              title: "Setup Finished: Start developing with Medusa",
              component: OrderDetailNextjs,
            },
          ]
        default:
          return [
            {
              id: "create_product",
              title: "Create Product",
              component: ProductsListDefault,
              onNext: (product: Product) => {
                setStepComplete({
                  step_id: "create_product",
                  extraData: { product_id: product.id },
                  onComplete: () => navigate(`/a/products/${product.id}`),
                });
              },
            },
            {
              id: "preview_product",
              title: "Preview Product",
              component: ProductDetailDefault,
              onNext: () => {
                setStepComplete({
                  step_id: "preview_product",
                  onComplete: () => navigate(`/a/orders`),
                });
              },
            },
            {
              id: "create_order",
              title: "Create an Order",
              component: OrdersListDefault,
              onNext: (order: Order) => {
                setStepComplete({
                  step_id: "create_order",
                  onComplete: () => navigate(`/a/orders/${order.id}`),
                });
              },
            },
            {
              id: "setup_finished",
              title: "Setup Finished: Start developing with Medusa",
              component: OrderDetailDefault,
            },
          ]
      }
    }
  }, [])

  // used to retrieve the index of a step by its ID
  const findStepIndex = useCallback((step_id: STEP_ID) => {
    return steps.findIndex((step) => step.id === step_id)
  }, [steps])

  // used to check if a step is completed
  const isStepComplete = useCallback((step_id: STEP_ID) => {
    return findStepIndex(currentStep) > findStepIndex(step_id)
  }, [findStepIndex, currentStep]);

  // used to change the open step when the current
  // step is retrieved from custom endpoints
  useEffect(() => {
    setOpenStep(currentStep);
    
    if (findStepIndex(currentStep) === steps.length - 1) setCompleted(true);
  }, [currentStep, findStepIndex]);
  
  // this is used to retrieve the data necessary
  // to move to the next onboarding step
  const getOnboardingParamStepData = useCallback(async (onboardingStep: string) => {
    switch (onboardingStep) {
      case "setup_finished_nextjs":
      case "setup_finished":
        const orderId = searchParams.get("order_id")
        if (orderId) {
          return (await client.admin.orders.retrieve(orderId)).order
        }

        throw new Error ("Required `order_id` parameter was not passed as a parameter")
      case "preview_product_nextjs":
      case "preview_product":
        const productId = searchParams.get("product_id")
        if (productId) {
          return (await client.admin.products.retrieve(productId)).product
        }

        throw new Error ("Required `product_id` parameter was not passed as a parameter")
      default:
        return null
    }
  }, [searchParams])

  // used to check if the `onboarding_step` path
  // parameter is passed and, if so, moves to that step
  // only if it's the next step and its necessary data is passed
  useEffect(() => {
    const onboardingStep = searchParams.get("onboarding_step") as STEP_ID
    const onboardingStepIndex = findStepIndex(onboardingStep)
    console.log("onboarding", onboardingStep, onboardingStepIndex, openStep)
    if (onboardingStep && onboardingStepIndex !== -1 && onboardingStep !== openStep) {
      // change current step to the onboarding step
      const openStepIndex = findStepIndex(openStep)
      console.log(openStepIndex)

      if (onboardingStepIndex !== openStepIndex + 1) {
        // can only go forward one step
        return
      }

      // retrieve necessary data and trigger the next function
      getOnboardingParamStepData(onboardingStep)
      .then((data) => {
        console.log("here", data)
        steps[openStepIndex].onNext?.(data)
      })
      .catch((e) => console.error(e))
    }
  }, [searchParams, openStep, getOnboardingParamStepData])

  if (
    !isLoading &&
    data?.status?.is_complete &&
    !localStorage.getItem("override_onboarding_finish")
  )
    return null;

  // a method that will be triggered when
  // the setup is started
  const onStart = () => {
    mutate({ current_step: steps[0].id });
    navigate(`/a/products`);
  };

  // a method that will be triggered when
  // the setup is completed
  const onComplete = () => {
    setCompleted(true);
  };

  // a method that will be triggered when
  // the setup is closed
  const onHide = () => {
    mutate({ is_complete: true });
  };

  return (
    <>
      <Container className={clx(
        "text-ui-fg-subtle px-0 pt-0 pb-4",
        {
          "mb-4": completed
        }
      )}>
        <Accordion
          type="single"
          value={openStep}
          onValueChange={(value) => setOpenStep(value as STEP_ID)}
        >
          <div className={clx(
            "flex py-6 px-8",
            {
              "items-start": completed,
              "items-center": !completed
            }
          )}>
            <div className="w-12 h-12 p-1 flex justify-center items-center rounded-full bg-ui-bg-base shadow-elevation-card-rest mr-4">
              <GetStarted />
            </div>
            {!completed ? (
              <>
                <div>
                  <Heading level="h1" className="text-ui-fg-base">Get started</Heading>
                  <Text>
                    Learn the basics of Medusa by creating your first order.
                  </Text>
                </div>
                <div className="ml-auto flex items-start gap-2">
                  {!!currentStep ? (
                    <>
                      {currentStep === steps[steps.length - 1].id ? (
                        <Button
                          variant="primary"
                          size="base"
                          onClick={() => onComplete()}
                        >
                          Complete Setup
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="base"
                          onClick={() => onHide()}
                        >
                          Cancel Setup
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="base"
                        onClick={() => onHide()}
                      >
                        Close
                      </Button>
                      <Button
                        variant="primary"
                        size="base"
                        onClick={() => onStart()}
                      >
                        Begin setup
                      </Button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <Heading level="h1" className="text-ui-fg-base">
                    Thank you for completing the setup guide!
                  </Heading>
                  <Text>
                    This whole experience was built using our new{" "}
                    <strong>widgets</strong> feature.
                    <br /> You can find out more details and build your own by
                    following{" "}
                    <a
                      href="https://docs.medusajs.com/admin/onboarding?ref=onboarding"
                      target="_blank"
                      className="text-blue-500 font-semibold"
                    >
                      our guide
                    </a>
                    .
                  </Text>
                </div>
                <div className="ml-auto flex items-start gap-2">
                  <Button
                    variant="secondary"
                    size="base"
                    onClick={() => onHide()}
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
          {
            <div>
              {(!completed ? steps : steps.slice(-1)).map((step) => {
                const isComplete = isStepComplete(step.id);
                const isCurrent = currentStep === step.id;
                return (
                  <Accordion.Item
                    title={step.title}
                    value={step.id}
                    headingSize="medium"
                    active={isCurrent}
                    complete={isComplete}
                    disabled={!isComplete && !isCurrent}
                    key={step.id}
                    {...(!isComplete &&
                      !isCurrent && {
                        customTrigger: <></>,
                      })}
                  >
                    <div className="pl-14 pb-6 pr-7">
                      <step.component
                        onNext={step.onNext}
                        isComplete={isComplete}
                        data={data?.status}
                        {...props}
                      />
                    </div>
                  </Accordion.Item>
                );
              })}
            </div>
          }
        </Accordion>
      </Container>
    </>
  );
};

export const config: WidgetConfig = {
  zone: [
    "product.list.before",
    "product.details.before",
    "order.list.before",
    "order.details.before",
  ],
};

export default OnboardingFlow;
