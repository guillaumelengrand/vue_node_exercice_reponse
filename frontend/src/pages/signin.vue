<script setup>
import axios from "@/plugins/axios";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
const { t: $t } = useI18n();

const { authenticate } = useAuthStore();
const router = useRouter();

const data = reactive({
  defaultView: true,
  valid: false,
  phoneNumberExists: false,
  lastnameExists: false,
  lastname: "",
  phone: "",
  code: "",
  registrationNumber: "",
});

const registrationNumberRules = [
  (value) => {
    if (value?.length >= 5 && value?.length <= 8) return true;
    return $t("errors.validator.isLength", { min: 5, max: 8 });
  },
];

async function submit() {
  if (data.phoneNumberExists) {
    loginWithCode();
  } else {
    requestCode();
  }
}

async function submitNumber() {
  if (data.lastname && data.registrationNumber) {
    loginWithRegistrationNumber();
  }
}

async function requestCode() {
  const auth = (
    await axios.post("/api/auth/sendCode", {
      phone: data.phone,
    })
  ).data;
  if (auth) {
    data.phoneNumberExists = true;
  } else {
    useMessageStore().error($t("login.phone_not_found"));
  }
}
async function loginWithCode() {
  const auth = (
    await axios.post("/api/auth/loginWithCode", {
      phone: data.phone,
      code: data.code,
    })
  ).data;

  if (!auth) {
    useMessageStore().error($t("login.incorrect_code"));
    return;
  }

  console.log({ data });

  await authenticate(auth.access_token);

  router.push("/").catch(() => {});
}

async function loginWithRegistrationNumber() {
  console.log("Registration with code");
  const auth = (
    await axios.post("/api/auth/loginWithRegistrationNumber", {
      lastname: data.lastname,
      registrationNumber: data.registrationNumber,
    })
  ).data;

  if (!auth) {
    useMessageStore().error($t("login.incorrectRegistrationNumber"));
    return;
  }

  await authenticate(auth.access_token);

  router.push("/").catch(() => {});
}

function switchView() {
  data.defaultView = !data.defaultView;
}
</script>
<template>
  <div>
    <!-- Login With phone number section -->
    <v-row justify="center" v-if="data.defaultView" dense>
      <v-col cols="12" sm="8" md="7" lg="5" xl="4">
        <v-card class="mt-5 elevation-12">
          <v-card-title class="text-center pb-0">
            {{ $t("login.title") }}
          </v-card-title>

          <v-form @submit.prevent="submit" v-model="data.valid">
            <v-card-text class="px-6">
              <v-phone-input
                defaultCountry="fr"
                v-model="data.phone"
                :countryLabel="null"
                :label="$t('login.phone')"
                :placeholder="$t('login.phone')"
                :preferCountries="['fr']"
              ></v-phone-input>
              <v-text-field
                class="prepend-icon-wide"
                v-if="data.phoneNumberExists"
                prepend-icon="mdi-key"
                :label="$t('login.code')"
                v-model="data.code"
                required
                :rules="[$v.required()]"
                type="number"
              ></v-text-field>
            </v-card-text>

            <v-card-actions class="justify-center">
              <v-btn
                v-show="!data.phoneNumberExists"
                type="submit"
                :disabled="data.phone && !data.valid"
                color="secondary"
              >
                {{ $t("login.sendCode") }}
              </v-btn>
              <v-btn
                v-show="data.phoneNumberExists"
                type="submit"
                :disabled="data.phone && !data.valid"
                color="secondary"
              >
                {{ $t("login.submit") }}
              </v-btn>
            </v-card-actions>
          </v-form>

          <v-card-actions class="justify-center">
            <v-btn v-on:click="switchView" class="mb-2" color="secondary">{{ $t("login.signinRegistration") }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Login With registration number section -->
    <v-row justify="center" v-if="!data.defaultView" dense>
      <v-col cols="12" sm="8" md="6" lg="5" xl="4">
        <v-card class="mt-5 elevation-12">
          <v-card-title class="text-center pb-0">
            {{ $t("login.title") }}
          </v-card-title>

          <v-form @submit.prevent="submitNumber" v-model="data.valid">
            <v-card-text class="px-6">
              <!-- <v-phone-input
                defaultCountry="fr"
                v-model="data.phone"
                :countryLabel="null"
                :label="$t('login.phone')"
                :placeholder="$t('login.phone')"
                :preferCountries="['fr']"
              ></v-phone-input> -->
              <v-text-field
                class="prepend-icon-wide"
                :label="$t('login.lastname')"
                v-model="data.lastname"
                required
                :rules="[$v.required()]"
                type="text"
              ></v-text-field>
              <v-text-field
                class="prepend-icon-wide"
                :label="$t('login.registrationNumber')"
                v-model="data.registrationNumber"
                required
                :rules="registrationNumberRules"
                type="number"
              ></v-text-field>
            </v-card-text>

            <v-card-actions class="justify-center">
              <!-- <v-btn
                v-show="!data.phoneNumberExists"
                type="submit"
                :disabled="data.phone && !data.valid"
                color="secondary"
              >
                {{ $t("login.sendCode") }}
              </v-btn> -->
              <v-btn
                type="submit"
                :disabled="data.lastname && data.registrationNumber && !data.valid"
                color="secondary"
              >
                {{ $t("login.submit") }}
              </v-btn>
            </v-card-actions>
          </v-form>

          <v-card-actions class="justify-center">
            <v-btn v-on:click="switchView" color="secondary">{{ $t("login.siginWithSms") }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style>
.prepend-icon-wide .v-input__prepend-outer {
  margin: 0 25px;
}
</style>
