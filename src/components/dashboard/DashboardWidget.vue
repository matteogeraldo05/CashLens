<script setup>
// DashboardWidget: displays a single stat card with title, value and optional tag.
import {
	PhArrowUp, PhForkKnife, PhLaptop, PhFilmSlate,
	PhCar, PhHouse, PhHeartbeat, PhDotsThree, PhPencilSimple,
} from '@phosphor-icons/vue';

const props = defineProps({
	widget: {
		type: Object,
		required: true,
	},
});

function formatValue(val) {
	return '$' + Math.abs(val).toLocaleString('en', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}
</script>

<template>
<div class="card">
	<header class="card-header">
		<p class="card-header-title">{{ widget.title }}</p>
	</header>
	<div class="card-content">
		<div class="content">
			<p class="title is-4" :class="widget.valueClass">
				{{ formatValue(widget.value) }}
			</p>
			<span v-if="widget.tag" class="tag" :class="widget.tagType" style="font-size: 10px;">
				{{ widget.tag }}
			</span>
		</div>
	</div>
</div>
</template>

<style scoped>
.card {
    background: rgba(255, 255, 255, 0);
    border-bottom: 1px solid rgba(20, 6, 6, 0);
    min-width: 220px;
    flex: 1;
    height: 100%;
}
</style>