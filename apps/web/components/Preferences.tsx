import React, { useEffect, useState } from "react";
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
  useColorMode,
} from "@chakra-ui/react";
import { BiSave } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { useNotificationTypes } from "@web3inbox/react";

function Preferences() {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const { data: notificationTypes, update } = useNotificationTypes();
  const [loading, setLoading] = useState(false);

  const { register, setValue, handleSubmit } = useForm();

  const onSubmitPreferences = handleSubmit(async (formData) => {
    setLoading(true);
    const enabledScopes = Object.entries(formData)
      .filter(([, isEnabled]) => isEnabled)
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
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast({
        title: error?.message as string,
        status: "error",
        variant: "subtle",
      });
    }
  });

  // Set default values of selected preferences
  useEffect(() => {
    Object.entries(notificationTypes ?? {}).forEach(([scopeKey, scope]) => {
      const s: any = scope;
      setValue(scopeKey, s.enabled);
    });
  }, [notificationTypes, setValue]);

  return (
    <AccordionItem borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}>
      <AccordionButton py="4">
        <Heading as="span" fontSize="md" flex="1" textAlign="left">
          Preferences (useNotificationTypes)
        </Heading>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4} display="flex" flexDir="column">
        <VStack as="form" onSubmit={onSubmitPreferences}>
          {Object.entries(notificationTypes ?? {})?.map(([scopeKey, scope]) => {
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
            isLoading={loading}
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
