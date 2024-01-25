import React, { useEffect } from "react";
import {
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  VStack,
  FormControl,
  FormLabel,
  Switch,
  Button,
  useToast,
} from "@chakra-ui/react";
import { BiSave } from "react-icons/bi";
import { useForm } from "react-hook-form";
import {
  useSubscriptionScopes,
  useUpdateSubscription,
} from "@web3inbox/widget-react";

function Preferences() {
  const toast = useToast();
  const { data: scopeData } = useSubscriptionScopes();
  const { update, isLoading: isLoadingUpdate } = useUpdateSubscription();

  const { register, setValue, handleSubmit } = useForm();

  const onSubmitPreferences = handleSubmit(async (formData) => {
    const enabledScopes = Object.entries(formData)
      .filter(([key, isEnabled]) => isEnabled)
      .map(([key]) => key);

    try {
      const isUpdated = await update(enabledScopes);

      if (isUpdated) {
        toast({
          title: "Preferences updated",
          status: "success",
          variant: "subtle",
        });
      }
    } catch (error) {
      toast({
        title: error?.message as string,
        status: "error",
        variant: "subtle",
      });
    }
  });

  // Set default values of selected preferences
  useEffect(() => {
    Object.entries(scopeData ?? {}).forEach(([scopeKey, scope]) => {
      const s: any = scope;
      setValue(scopeKey, s.enabled);
    });
  }, [scopeData, setValue]);

  return (
    <AccordionItem>
      <AccordionButton>
        <Heading as="span" fontSize="md" flex="1" textAlign="left">
          Preferences
        </Heading>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4} display="flex" flexDir="column">
        <VStack as="form" onSubmit={onSubmitPreferences}>
          {Object.entries(scopeData ?? {})?.map(([scopeKey, scope]) => {
            return (
              <FormControl
                key={scopeKey}
                display="flex"
                justifyContent="space-between"
                gap={4}
              >
                <FormLabel htmlFor={scopeKey}>{scope?.name}</FormLabel>
                <Switch
                  id={scopeKey}
                  defaultChecked={(scope as any).enabled}
                  {...register(scopeKey)}
                />
              </FormControl>
            );
          })}
          <Button
            leftIcon={<BiSave />}
            alignSelf="flex-end"
            variant="outline"
            colorScheme="blue"
            type="submit"
            rounded="full"
            isLoading={isLoadingUpdate}
            loadingText="Saving..."
          >
            Save preferences
          </Button>
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
}

export default Preferences;
