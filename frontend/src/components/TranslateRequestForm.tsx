"use client";
import { TranslateRequest } from "@a2t/shared-types";
import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslate } from "@/hooks";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useApp } from "./AppProvider";
import { Loading } from "./ui/loading";
import { Combobox } from "./ui/combobox";

const TranslateRequestForm: React.FC = () => {
  const { isTranslating, translate } = useTranslate();
  const { selectedTranslation } = useApp();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TranslateRequest>();

  useEffect(() => {
    if (selectedTranslation) {
      setValue("sourceLang", selectedTranslation.sourceLang);
      setValue("sourceText", selectedTranslation.sourceText);
      setValue("targetLang", selectedTranslation.targetLang);
    }
  }, [selectedTranslation, setValue]);
  const onSubmit: SubmitHandler<TranslateRequest> = (data, event) => {
    event && event.preventDefault();
    translate(data);
  };

  const options = [
    {
      value: "en",
      label: "English",
      data: 1,
    },
    {
      value: "es",
      label: "Spanish",
      data: 2,
    },
    {
      value: "fr",
      label: "French",
      data: 3,
    },
    {
      value: "de",
      label: "German",
      data: 4,
    },
    {
      value: "it",
      label: "Italian",
      data: 5,
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="sourceText">Input Text</Label>
        <Textarea
          id="sourceText"
          {...register("sourceText", { required: true })}
          rows={3}
        />
        {errors.sourceText && <span>field is required</span>}
      </div>
      <div>
        <Label htmlFor="sourceLang">Input Language</Label>
        <Combobox
          placeholder="language"
          onSelect={(language) => {
            setValue("sourceLang", language.value);
          }}
          options={options}
          selected={
            options.find((o) => o.value === selectedTranslation?.sourceLang) ||
            null
          }
        />
        {errors.sourceLang && <span>field is required</span>}
      </div>
      <div>
        <Label htmlFor="targetLang">Output Language</Label>
        <Combobox
          placeholder="language"
          onSelect={(language) => {
            setValue("targetLang", language.value);
          }}
          options={options}
          selected={
            options.find((o) => o.value === selectedTranslation?.targetLang) ||
            null
          }
        />
        {errors.targetLang && <span>field is required</span>}
      </div>
      <div className="py-2">
        <Button type="submit" className="w-full font-semibold">
          {isTranslating ? <Loading /> : "Translate"}
        </Button>
      </div>

      <div>
        <Label htmlFor="targetText">Translated Text</Label>
        <Textarea
          readOnly
          id="targetText"
          value={selectedTranslation?.targetText}
          rows={3}
        />
      </div>
    </form>
  );
};

export default TranslateRequestForm;
